import { Schema, model } from "mongoose";
import { IHighlightService } from "./highlight_service.interface";

const highlightServiceSchema = new Schema<IHighlightService>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const HighlightService = model<IHighlightService>(
  "HighlightService",
  highlightServiceSchema
);