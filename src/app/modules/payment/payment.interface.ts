import { Types } from "mongoose";

export enum PaymentProvider {
  STRIPE = "STRIPE",
  GOOGLE_PAY = "GOOGLE_PAY",
  APPLE_PAY = "APPLE_PAY",
}

export enum PaymentStatus {
  PAID = "PAID",
  PENDING = "PENDING",
  FAILED = "FAILED",
  CANCELED = "CANCELED",
}

export interface IPayment {
  _id?: Types.ObjectId;
  user: Types.ObjectId;          // the provider's userId
  service: Types.ObjectId;       // the service being subscribed
  plan: Types.ObjectId;          // the chosen plan
  transaction_id: string;
  amount: number;
  currency?: string;
  payment_gateway_charge?: number;
  provider: PaymentProvider;
  payment_status: PaymentStatus;
  invoice_url?: string;
  stripe_session_id?: string;
  payment_intent_id?: string;
}