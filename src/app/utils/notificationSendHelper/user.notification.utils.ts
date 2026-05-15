import { Types } from 'mongoose';

import { io } from '../../socket';
import { INotification } from '../../modules/notification/notification.interface';
import { Notification, NotificationPreference } from '../../modules/notification/notification.model';

export const sendPersonalNotification = async (payload: INotification) => {
  // Save to DB (for offline support)
  const notification = await Notification.create(payload);

  const receiverNotificationPreferences = await NotificationPreference.findOne({
    user: payload.user,
  });

  if (receiverNotificationPreferences?.channel.inApp) {
    const userRoom = (payload.user as Types.ObjectId).toString();
    // Send real-time
    io.to(userRoom).emit('notification', notification);
  }
};
