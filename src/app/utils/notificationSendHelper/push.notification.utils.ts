/* eslint-disable no-console */
import admin from '../../config/firebase.config';
import { INotification } from '../../modules/notification/notification.interface';
import { Notification } from '../../modules/notification/notification.model';

import { User } from '../../modules/user/user.model';


export const sendPushAndSave = async (payload: INotification) => {
  try {
    console.log(' [PUSH NOTIFICATION] Attempting to send push notification:', {
      userId: payload.user,
      title: payload.title,
      description: payload.description,
      data: payload.data,
    });

    // Save in MongoDB
    const notification = await Notification.create({ ...payload });
    console.log(' [PUSH NOTIFICATION] Saved to DB:', {
      notificationId: notification._id,
      type: notification.type,
      data: notification.data,
    });

    const user = await User.findById(payload.user);
    
    if (!user) {
      console.log(' [PUSH NOTIFICATION] User not found');
      return;
    }
    
    if (!user.fcmToken) {
      console.log(' [PUSH NOTIFICATION] User has no FCM token:', user._id);
      return;
    }

    console.log(' [PUSH NOTIFICATION] User found with FCM token(s):', {
      userId: user._id,
      tokenCount: Array.isArray(user.fcmToken) ? user.fcmToken.length : 1,
    });

    // support multiple device tokens
    if (Array.isArray(user.fcmToken)) {
      console.log(' [PUSH NOTIFICATION] Sending to', user.fcmToken.length, 'tokens');
      
      // Send to each token individually
      const sendPromises = user.fcmToken.map(token =>
        admin.messaging().send({
          token,
          notification: {
            title: payload.title,
            body: payload.description,
          },
          data: {
            type: payload.type,
            ...((payload.data as Record<string, string>) || {}),
          },
        })
      );

      const results = await Promise.all(sendPromises);
      console.log(' [PUSH NOTIFICATION] Sent to', results.length, 'tokens:', results);
    } else {
      const message = {
        token: user.fcmToken,
        notification: {
          title: payload.title,
          body: payload.description,
        },
        data: {
          type: payload.type,
          ...((payload.data as Record<string, string>) || {}),
        }, // optional key-value pairs
      };

      console.log(' [PUSH NOTIFICATION] Sending to single token');
      const result = await admin.messaging().send(message); // Send notificaton via FCM
      console.log(' [PUSH NOTIFICATION] Single message sent successfully:', result);
    }

    return notification;
  } catch (err) {
    console.error('❌ [PUSH NOTIFICATION] Error sending notification:', err);
  }
};
