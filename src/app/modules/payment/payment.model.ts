import { model, Schema } from "mongoose";
import { IPayment, PaymentProvider, PaymentStatus } from "./payment.interface";

const PaymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    transaction_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "GBP",
    },
    payment_gateway_charge: {
      type: Number,
      min: 0,
    },
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      required: true,
    },
    payment_status: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
      default: PaymentStatus.PENDING,
      index: true,
    },
    invoice_url: {
      type: String,
      trim: true,
    },
    stripe_session_id: {
      type: String,
      trim: true,
    },
    payment_intent_id: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

PaymentSchema.index({ service: 1, transaction_id: 1 }, { unique: true });

export const PaymentModel = model<IPayment>("Payment", PaymentSchema);