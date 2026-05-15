import { Schema, model } from 'mongoose';
import { IServiceAnalytics } from './serviceAnalytics.interface';

const serviceAnalyticsSchema = new Schema<IServiceAnalytics>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['view', 'impression'],
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

serviceAnalyticsSchema.index({ service: 1, type: 1 });
serviceAnalyticsSchema.index({ service: 1, type: 1, createdAt: -1 });

export const ServiceAnalytics = model<IServiceAnalytics>(
  'ServiceAnalytics',
  serviceAnalyticsSchema
);