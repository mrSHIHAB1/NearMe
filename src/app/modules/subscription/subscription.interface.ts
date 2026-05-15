import { Types } from "mongoose";

export type TSubscriptionStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "pending"
  | "payment_failed";

export interface TSubscription {
  user: Types.ObjectId;
  plan: Types.ObjectId;

  status: TSubscriptionStatus;

  startDate: Date;
  endDate: Date;

  autoRenew: boolean;

  amount: number;
  currency: string;

  paymentMethod?: string;
  paymentGateway?: string;
  transactionId?: string;
  isCurrent: boolean;
}