import { Schema, model } from "mongoose";
import { TPlan } from "./plan.interface";

const planSchema = new Schema<TPlan>(
  {
    name: {
      type: String,
      enum: ["free", "basic", "pro", "elite"],
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "GBP" },
    interval: { type: String, enum: ["monthly"], default: "monthly" },
    description: { type: String },
    features: {
      maxPhotos: { type: Number, required: true },
      maxOfferServices: { type: Number, required: true },
      badgeType: {
        type: String,
        enum: ["none", "active", "verified_pro", "elite"],
        default: "none",
      },
      analyticsType: {
        type: String,
        enum: ["none", "basic", "detailed"],
        default: "none",
      },
      priorityScore: { type: Number, required: true, default: 0 },
      canReplyToReviews: { type: Boolean, default: false },
      isHomepageFeaturedEligible: { type: Boolean, default: false },
      hasHighlightedProfileBorder: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Plan = model<TPlan>("Plan", planSchema);