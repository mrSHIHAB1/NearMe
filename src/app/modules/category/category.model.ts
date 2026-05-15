import { Schema, model } from "mongoose";
import { ICategory } from "./category.interface";

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },

    image: { type: String, required: false },

    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    level: {
      type: Number,
      enum: [0, 1, 2],
      required: true,
    },

    isCustom: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: true, // admin created = auto approved
    },
  },
  { timestamps: true }
);

export const Category = model<ICategory>("Category", categorySchema);