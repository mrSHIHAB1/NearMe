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
  originalTransactionId?: string;
  productId?: string;
  platform?: "APPLE_IAP" | "GOOGLE_PLAY";
  isCurrent: boolean;
}