import express, { Router } from "express";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { paymentControllers } from "./payment.controller";

const router = Router();

/* ------------------------------------------------------------------ */
/*  Stripe Checkout — provider initiates a plan subscription          */
/*  Body: { serviceId: string, planId: string }                       */
/* ------------------------------------------------------------------ */
router.post(
  "/stripe_pay",
  checkAuth(Role.PROVIDER),
  paymentControllers.stripePayment
);

/* ------------------------------------------------------------------ */
/*  Stripe Webhook — called by Stripe after payment events            */
/*                                                                     */
/*  CRITICAL: express.raw() must be used here so the raw request body */
/*  is available for Stripe's signature verification.                  */
/*  Make sure your app.ts does NOT apply express.json() globally       */
/*  before this route, or mount this router BEFORE the json middleware.*/
/* ------------------------------------------------------------------ */
router.post(
  "/stripe_webhook",
  express.raw({ type: "application/json" }),
  paymentControllers.stripeWebhook
);

export const PaymentRouter = router;