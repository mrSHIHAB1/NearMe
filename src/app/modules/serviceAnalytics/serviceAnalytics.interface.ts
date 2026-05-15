import { Types } from 'mongoose';

export type ServiceAnalyticsType = 'view' | 'impression';

export interface IServiceAnalytics {
  service: Types.ObjectId;
  user?: Types.ObjectId;
  type: ServiceAnalyticsType;
  createdAt?: Date;
}

export interface IChartDataPoint {
  label: string;
  count: number;
}

export interface IAnalyticsDashboardResponse {
  totalImpressions: number | null;
  totalViews: number | null;
  impressionChart: IChartDataPoint[] | null;
  viewChart: IChartDataPoint[] | null;
  locked: {
    impressions: boolean;
    views: boolean;
  };
  analyticsType: string;
}