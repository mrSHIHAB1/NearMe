/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from "mongoose";
import { Request } from "express";
import Stripe from "stripe";
import { StatusCodes } from "http-status-codes";


import { envVars } from "../../config/env"; // adjust to your env config path
import { Role } from "../user/user.interface";

import { PaymentModel } from "./payment.model";
import { PaymentProvider, PaymentStatus } from "./payment.interface";
import { generateTransactionId } from "./payment.utils";
import { Plan } from "../plan/plan.model";
import { Service } from "../service/service.model";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";

/* ------------------------------------------------------------------ */
/*  Stripe client                                                       */
/* ------------------------------------------------------------------ */
const stripe = new Stripe(envVars.STRIPE_SECRET_KEY as string);

/* ================================================================== */
/*  WEBHOOK HELPERS                                                    */
/* ================================================================== */

/**
 * Called when Stripe confirms a successful payment.
 * Marks the payment as PAID and activates the plan on the service.
 */
const paymentSuccessHandler = async (
  session: any
): Promise<void> => {
  const { payment: paymentId, service: serviceId, plan: planId } =
    session.metadata as {
      payment: string;
      service: string;
      plan: string;
    };

  // Update payment status to PAID
  await PaymentModel.updateOne(
    { _id: new Types.ObjectId(paymentId) },
    {
      payment_status: PaymentStatus.PAID,
      payment_intent_id: session.payment_intent as string,
    }
  );

  // Activate the plan on the service:
  // Store the active plan and set a subscription expiry 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await Service.findByIdAndUpdate(new Types.ObjectId(serviceId), {
    activePlan: new Types.ObjectId(planId),
    subscriptionExpiresAt: expiresAt,
    subscriptionStatus: "active",
  });
};

/**
 * Called when Stripe reports a failed or expired checkout session.
 * Marks the payment as FAILED.
 */
const paymentFailedHandler = async (
  session: any
): Promise<void> => {
  const { payment: paymentId } = session.metadata as { payment: string };

  await PaymentModel.updateOne(
    { _id: new Types.ObjectId(paymentId) },
    { payment_status: PaymentStatus.FAILED }
  );
};

/* ================================================================== */
/*  FREE PLAN — no Stripe needed                                       */
/* ================================================================== */

/**
 * When a provider picks the FREE plan we:
 *  1. Record a PAID payment (amount = 0) straight away.
 *  2. Activate the plan on the service.
 *  3. Return a success flag so the controller can redirect the user.
 */
const handleFreePlan = async (
  userId: Types.ObjectId,
  serviceId: Types.ObjectId,
  planId: Types.ObjectId,
  planCurrency: string
): Promise<{ free: true }> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const payment = await PaymentModel.create(
      [
        {
          user: userId,
          service: serviceId,
          plan: planId,
          transaction_id: generateTransactionId(),
          amount: 0,
          currency: planCurrency.toUpperCase(),
          provider: PaymentProvider.STRIPE, // provider field is still required; use STRIPE as default
          payment_status: PaymentStatus.PAID,
        },
      ],
      { session }
    );

    // Activate the free plan — no expiry for free tier
    await Service.findByIdAndUpdate(
      serviceId,
      {
        activePlan: planId,
        subscriptionStatus: "active",
        subscriptionExpiresAt: null, // free plan never expires
      },
      { session }
    );

    await session.commitTransaction();
    return { free: true };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/* ================================================================== */
/*  STRIPE PAYMENT — paid plans                                        */
/* ================================================================== */

/**
 * Initiates a Stripe Checkout session for a paid plan.
 *
 * Flow:
 *  1. Validate that the caller is a PROVIDER who owns a service.
 *  2. Ensure the chosen plan exists and is not already active.
 *  3. Persist a PENDING payment record inside a transaction.
 *  4. Create a Stripe Checkout session and return its URL.
 */
const stripePay = async (
  user: JwtPayload,
  _serviceId: string,
  _planId: string
): Promise<{ checkout_url: string | null } | { free: true }> => {
  /* ---------- ROLE GUARD ---------- */
  if (user.role !== Role.PROVIDER) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Only service providers can subscribe to a plan"
    );
  }

  const userId = new Types.ObjectId(user.userId);
  const serviceId = new Types.ObjectId(_serviceId);
  const planId = new Types.ObjectId(_planId);

  /* ---------- VALIDATION ---------- */
  const [service, plan] = await Promise.all([
    Service.findOne({ _id: serviceId, provider: user.userId }),
    Plan.findById(planId),
  ]);

  if (!service) {
    throw new AppError(StatusCodes.NOT_FOUND, "Service not found");
  }
  if (!plan) {
    throw new AppError(StatusCodes.NOT_FOUND, "Plan not found");
  }
  if (!plan.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This plan is no longer available");
  }

  // Check if this service already has this plan active
  if (
    service.activePlan &&
    service.activePlan.equals(planId) &&
    service.subscriptionStatus === "active"
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "This plan is already active for your service"
    );
  }

  /* ---------- FREE PLAN SHORTCUT ---------- */
  if (plan.price === 0) {
    return handleFreePlan(userId, serviceId, planId, plan.currency);
  }

  /* ---------- TRANSACTION: persist pending payment ---------- */
  const session = await mongoose.startSession();
  let payment: any;

  try {
    session.startTransaction();

    payment = await PaymentModel.create(
      [
        {
          user: userId,
          service: serviceId,
          plan: planId,
          transaction_id: generateTransactionId(),
          amount: plan.price,
          currency: plan.currency.toUpperCase(),
          provider: PaymentProvider.STRIPE,
          payment_status: PaymentStatus.PENDING,
        },
      ],
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  /* ---------- STRIPE CHECKOUT SESSION ---------- */
  const amountInCents = Math.round(plan.price * 100);

  const stripePayload = {
    payment_method_types: ["card"] as any,
    line_items: [
      {
        price_data: {
          currency: plan.currency.toLowerCase(),
          product_data: {
            name: `${plan.title} — ${service.service_name}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment"  as const,
    // Session expires in 30 minutes
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    metadata: {
      payment: payment[0]._id.toString(),
      service: serviceId.toString(),
      plan: planId.toString(),
    },
    success_url: `${envVars.FRONTEND_URL}/payment_success?tr_id=${payment[0].transaction_id}&service_id=${serviceId.toString()}`,
    cancel_url: `${envVars.FRONTEND_URL}/payment_cancel?tr_id=${payment[0].transaction_id}&service_id=${serviceId.toString()}`,
  };

  // Use payment._id as idempotency key so retries don't double-charge
  const idempotencyKey = { idempotencyKey: payment[0]._id.toString() };

  try {
    const stripeSession = await stripe.checkout.sessions.create(
      stripePayload,
      idempotencyKey
    );

    // Persist the stripe session ID so the webhook can look it up
    await PaymentModel.updateOne(
      { _id: payment[0]._id },
      { stripe_session_id: stripeSession.id }
    );

    return { checkout_url: stripeSession.url };
  } catch (error: any) {
    // If Stripe call fails, mark the pending payment as FAILED
    await PaymentModel.updateOne(
      { _id: payment[0]._id },
      { payment_status: PaymentStatus.FAILED }
    );

    throw new AppError(StatusCodes.BAD_GATEWAY, error.message);
  }
};

/* ================================================================== */
/*  STRIPE WEBHOOK HANDLER                                             */
/* ================================================================== */

/**
 * Validates the Stripe webhook signature and routes the event to the
 * correct handler.
 *
 * IMPORTANT: The route for this endpoint must use express.raw() (not
 * express.json()) so that the raw request body is available for
 * signature verification. See payment.route.ts.
 */
const stripeWebhookHandling = async (req: Request): Promise<{ received: true }> => {
  const signature = req.headers["stripe-signature"] as string;

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // must be raw Buffer — see route setup
      signature,
      envVars.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Webhook signature verification failed: ${err.message}`
    );
  }

  /* ---------- EVENT ROUTING ---------- */
  switch (event.type) {
    // Payment completed successfully
    case "checkout.session.completed": {
      const session = event.data.object as any;
      await paymentSuccessHandler(session);
      break;
    }

    // User let the session expire without paying
    case "checkout.session.expired":
    // Card was declined or otherwise failed
    // eslint-disable-next-line no-fallthrough
    case "payment_intent.payment_failed": {
      const session = event.data.object as any;
      await paymentFailedHandler(session);
      break;
    }

    // All other events are intentionally ignored
    default:
      break;
  }

  return { received: true };
};

/* ================================================================== */
/*  EXPORTS                                                            */
/* ================================================================== */
export const paymentService = {
  stripePay,
  stripeWebhookHandling,
};