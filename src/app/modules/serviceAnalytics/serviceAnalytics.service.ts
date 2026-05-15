/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { ServiceAnalytics } from './serviceAnalytics.model';
import { Service } from '../service/service.model';
import { Plan } from '../plan/plan.model';
import { User } from '../user/user.model';
import { ServiceAnalyticsType, IAnalyticsDashboardResponse, IChartDataPoint } from './serviceAnalytics.interface';
import { Types } from 'mongoose';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Builds weekly chart data (last 7 days, grouped by day-of-week label).
 */
const buildWeeklyChart = async (
  serviceId: Types.ObjectId,
  type: ServiceAnalyticsType
): Promise<IChartDataPoint[]> => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const raw = await ServiceAnalytics.aggregate([
    {
      $match: {
        service: serviceId,
        type,
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' }, // 1=Sun ... 7=Sat
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(raw.map((r) => [r._id as number, r.count as number]));

  // Build last 7 days in order
  const result: IChartDataPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayOfWeek = d.getDay() + 1; // getDay() returns 0-6, $dayOfWeek returns 1-7
    result.push({
      label: WEEK_DAYS[d.getDay()],
      count: countMap.get(dayOfWeek) || 0,
    });
  }

  return result;
};

/**
 * Builds yearly chart data (current year, grouped by month).
 */
const buildYearlyChart = async (
  serviceId: Types.ObjectId,
  type: ServiceAnalyticsType
): Promise<IChartDataPoint[]> => {
  const currentYear = new Date().getFullYear();

  const raw = await ServiceAnalytics.aggregate([
    {
      $match: {
        service: serviceId,
        type,
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31T23:59:59`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' }, // 1=Jan ... 12=Dec
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(raw.map((r) => [r._id as number, r.count as number]));

  return MONTHS.map((label, idx) => ({
    label,
    count: countMap.get(idx + 1) || 0,
  }));
};

// ─── Track ────────────────────────────────────────────────────────────────────

/**
 * Records a single view or impression event for a service.
 * Called by the frontend when a service is rendered (impression) or opened (view).
 */
const trackEvent = async (
  serviceId: string,
  type: ServiceAnalyticsType,
  userId?: string
) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, 'Service not found');
  }

  await ServiceAnalytics.create({
    service: new Types.ObjectId(serviceId),
    type,
    ...(userId ? { user: new Types.ObjectId(userId) } : {}),
  });

  return { tracked: true };
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * Returns analytics data for the authenticated provider's service.
 * Data returned depends on the provider's plan analyticsType:
 *   - "none"     → everything locked
 *   - "basic"    → impressions only (total + weekly chart)
 *   - "detailed" → impressions + views (totals + charts)
 */
const getDashboardAnalytics = async (
  userId: string,
  impressionPeriod: 'week' | 'year' = 'week',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  viewPeriod: 'year' = 'year'
): Promise<IAnalyticsDashboardResponse> => {
  // 1. Find the provider's service
  const service = await Service.findOne({ provider: userId }).select('_id');
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, 'No service found for this provider');
  }

  // 2. Resolve the provider's current plan analyticsType
  const user = await User.findById(userId).select('subscriptionInfo').lean();
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const planName = (user as any)?.subscriptionInfo?.planName || 'free';
  const plan = await Plan.findOne({ name: planName }).select('features.analyticsType').lean();
  const analyticsType = plan?.features?.analyticsType || 'none';

  // 3. Build response based on plan
  const locked = {
    impressions: analyticsType === 'none',
    views: analyticsType !== 'detailed',
  };

  const serviceId = service._id as Types.ObjectId;

  // 4. Fetch impression data (available for "basic" and "detailed")
  let totalImpressions: number | null = null;
  let impressionChart: IChartDataPoint[] | null = null;

  if (analyticsType === 'basic' || analyticsType === 'detailed') {
    totalImpressions = await ServiceAnalytics.countDocuments({
      service: serviceId,
      type: 'impression',
    });

    impressionChart =
      impressionPeriod === 'week'
        ? await buildWeeklyChart(serviceId, 'impression')
        : await buildYearlyChart(serviceId, 'impression');
  }

  // 5. Fetch view data (available for "detailed" only)
  let totalViews: number | null = null;
  let viewChart: IChartDataPoint[] | null = null;

  if (analyticsType === 'detailed') {
    totalViews = await ServiceAnalytics.countDocuments({
      service: serviceId,
      type: 'view',
    });

    viewChart = await buildYearlyChart(serviceId, 'view');
  }

  return {
    totalImpressions,
    totalViews,
    impressionChart,
    viewChart,
    locked,
    analyticsType,
  };
};

export const ServiceAnalyticsService = {
  trackEvent,
  getDashboardAnalytics,
};