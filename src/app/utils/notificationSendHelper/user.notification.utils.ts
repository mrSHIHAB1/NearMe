/* eslint-disable no-console */
import { Types } from 'mongoose';

import { io } from '../../socket';
import { INotification } from '../../modules/notification/notification.interface';
import { Notification } from '../../modules/notification/notification.model';

export const sendPersonalNotification = async (payload: INotification) => {
  console.log(' [SOCKET NOTIFICATION] User is online, sending real-time notification:', {
    userId: payload.user,
    title: payload.title,
    description: payload.description,
    data: payload.data,
  });

  // Save to DB (for offline support)
  const notification = await Notification.create(payload);
  console.log(' [SOCKET NOTIFICATION] Saved to DB:', {
    notificationId: notification._id,
    type: notification.type,
    data: notification.data,
  });

  const userRoom = (payload.user as Types.ObjectId).toString();
  // Send real-time notification
  io.to(userRoom).emit('notification', notification);
  
  console.log('[SOCKET NOTIFICATION] Notification emitted to room:', userRoom);
};
