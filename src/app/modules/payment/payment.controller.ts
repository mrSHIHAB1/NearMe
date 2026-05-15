/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
import { JwtPayload } from "jsonwebtoken";

/* ------------------------------------------------------------------ */
/*  POST /payment/stripe_pay                                           */
/*  Body: { serviceId, planId }                                       */
/* ------------------------------------------------------------------ */
const stripePayment = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as JwtPayload;
    const { serviceId, planId } = req.body;

    const result = await paymentService.stripePay(user, serviceId, planId);

    // Differentiate free vs paid in the response so the frontend
    // knows whether to redirect to Stripe or straight to the dashboard.
    if ("free" in result) {
      return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Free plan activated successfully",
        data: { free: true },
      });
    }

    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Checkout session created",
      data: result, // { checkout_url: "https://checkout.stripe.com/..." }
    });
  }
);

/* ------------------------------------------------------------------ */
/*  POST /payment/stripe_webhook                                       */
/*  NOTE: this route must use express.raw() middleware — see route.ts */
/* ------------------------------------------------------------------ */
const stripeWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await paymentService.stripeWebhookHandling(req);

    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Webhook received",
      data: result,
    });
  }
);

export const paymentControllers = {
  stripePayment,
  stripeWebhook,
};