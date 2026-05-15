import httpStatus from 'http-status-codes';
import { NotificationService } from './notification.service';
import { JwtPayload } from 'jsonwebtoken';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

// Get user's notification preferences (using)
const getUserNotificationPreferences = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userId = user?.userId;

  const result =
    await NotificationService.getUserNotificationPreferences(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification preferences retrieved successfully',
    data: result,
  });
});

// Update notification preferences (bulk update) (using)
const updateNotificationPreferences = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userId = user?.userId;
  const payload = req.body;

  const result = await NotificationService.updateNotificationPreferences(
    userId,
    payload
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification preferences updated successfully',
    data: result,
  });
});

// Get user's notification preferences (using)
const getUserNotifications = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;
  const query = req.query as Record<string, string>;
  const result = await NotificationService.getUsersNotificationService(
    userId,
    query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification retrieved successfully',
    data: result,
  });
});

// Get user's notification preferences (using)
const sendSystemNotification = catchAsync(async (req, res) => {
  const paylod = req.body;
  const result =
    await NotificationService.sendSystemNotificationService(paylod);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification retrieved successfully',
    data: result,
  });
});

export const NotificationController = {
  getUserNotificationPreferences,
  updateNotificationPreferences,
  getUserNotifications,
  sendSystemNotification,
};
