import { Schema, model } from "mongoose";
import { IReview } from "./review.interface";

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },

    rating: {
      type: Number,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      required: true,
      trim: true
    },

    parentReview: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      default: null
    },

    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review"
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Review = model<IReview>("Review", reviewSchema);