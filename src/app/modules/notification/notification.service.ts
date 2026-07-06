import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import {
  INotification,
  INotificationPreference,
  NotificationType,
} from './notification.interface';
import { Notification, NotificationPreference } from './notification.model';
import { io } from '../../socket';
import admin from '../../config/firebase.config';

// Get user's notification preferences (using)
const getUserNotificationPreferences = async (userId: string) => {
  const preferences = await NotificationPreference.findOne({ user: userId });

  if (!preferences) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification preferences not found'
    );
  }

  return preferences;
};

// Update notification preferences (using)
const updateNotificationPreferences = async (
  userId: string,
  payload: Partial<INotificationPreference>
) => {
  const preferences = await NotificationPreference.findOne({ user: userId });

  if (!preferences) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification preferences not found'
    );
  }

  const updatedPreferences = await NotificationPreference.findOneAndUpdate(
    { user: userId },
    payload,
    { new: true, runValidators: true }
  );

  return updatedPreferences;
};

// Get user's notification
const getUsersNotificationService = async (
  userId: string,
  query: Record<string, string>
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const sort = query.sort || '-createdAt';

  const notifications = await Notification.find({
    $or: [
      { user: userId },
      { receiverIds: [userId] },
      { type: NotificationType.SYSTEM },
    ],
  })
    .select('_id user eventId chatId receiverIds type title description data isRead createdAt')
    .skip(skip)
    .limit(limit)
    .sort(sort);

  return notifications;
};

// SAVE SYSTEM NOTIFICATION FOR ALL USER'S
const sendSystemNotificationService = async (payload: INotification) => {
  const notificationPayload: INotification = {
    title: payload.title,
    description: payload.description,
    type: payload.type,
  };

  const notify_users = await Notification.create(notificationPayload);

  io.emit('notification', notify_users);

  return null;
};

// Mark a notification as seen/read by the user
const markNotificationAsSeen = async (userId: string, notificationId: string) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      $or: [{ user: userId }, { receiverIds: [userId] }],
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  // emit update via socket if needed
  io.to(userId).emit('notification_updated', notification);

  return notification;
};

// Delete a notification for the user
const deleteNotificationService = async (userId: string, notificationId: string) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    $or: [{ user: userId }, { receiverIds: [userId] }],
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  io.to(userId).emit('notification_deleted', { id: notificationId });

  return null;
};
const sendTestPush = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'FCM token is required');
  }

  const message = {
    notification: {
      title: 'Test Push 2',
      body: 'This is a test notification from NotificationService',
    },
    data: { test: 'value' },
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to send push notification'
    );
  }
};
export const NotificationService = {
  getUserNotificationPreferences,
  updateNotificationPreferences,
  getUsersNotificationService,
  sendSystemNotificationService,
  markNotificationAsSeen,
  deleteNotificationService,
  sendTestPush,
};
