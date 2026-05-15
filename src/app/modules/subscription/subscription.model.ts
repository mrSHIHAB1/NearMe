import { Schema, model } from "mongoose";
import { TSubscription } from "./subscription.interface";

const subscriptionSchema = new Schema<TSubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending", "payment_failed"],
      default: "pending",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: false },

    amount: { type: Number, required: true },
    currency: { type: String, default: "GBP" },

    paymentMethod: { type: String },
    paymentGateway: { type: String },
    transactionId: { type: String },

    isCurrent: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, isCurrent: 1 });
subscriptionSchema.index({ endDate: 1 });

export const Subscription = model<TSubscription>(
  "Subscription",
  subscriptionSchema
);