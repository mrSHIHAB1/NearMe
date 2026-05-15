import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { ServiceAnalyticsService } from './serviceAnalytics.service';
import AppError from '../../errorHelpers/AppError';

/**
 * POST /analytics/track
 * Body: { serviceId: string, type: 'view' | 'impression' }
 * Auth: optional (pass userId if logged in, skip if anonymous)
 */
const trackEvent = catchAsync(async (req: Request, res: Response) => {
  const { serviceId, type } = req.body;

  if (!serviceId || !type) {
    throw new AppError(httpStatus.BAD_REQUEST, 'serviceId and type are required');
  }

  if (!['view', 'impression'].includes(type)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'type must be "view" or "impression"');
  }

  // userId is optional — anonymous users can still generate analytics events
  const userId = (req.user as JwtPayload)?.userId;

  const result = await ServiceAnalyticsService.trackEvent(serviceId, type, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Event tracked successfully',
    data: result,
  });
});

/**
 * GET /analytics/dashboard?impressionPeriod=week&viewPeriod=year
 * Auth: required (provider only)
 */
const getDashboardAnalytics = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const impressionPeriod = (req.query.impressionPeriod as 'week' | 'year') || 'week';
  const viewPeriod = (req.query.viewPeriod as 'year') || 'year';

  const data = await ServiceAnalyticsService.getDashboardAnalytics(
    user.userId,
    impressionPeriod,
    viewPeriod
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Dashboard analytics retrieved successfully',
    data,
  });
});

export const ServiceAnalyticsController = {
  trackEvent,
  getDashboardAnalytics,
};