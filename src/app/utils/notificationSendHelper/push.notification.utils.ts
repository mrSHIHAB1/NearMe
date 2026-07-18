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
      // Filter out invalid tokens
      const validTokens = user.fcmToken.filter(
        (token) => token && typeof token === 'string' && token.trim().length > 0
      );

      if (validTokens.length === 0) {
        console.log(' [PUSH NOTIFICATION] No valid FCM tokens found');
        return notification;
      }

      console.log(' [PUSH NOTIFICATION] Sending to', validTokens.length, 'tokens');
      
      // Send to each token individually using allSettled to handle partial failures
      const sendPromises = validTokens.map(token =>
        admin.messaging().send({
          token: token.trim(),
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

      const results = await Promise.allSettled(sendPromises);
      
      // Track failed tokens for cleanup
      const failedTokens: string[] = [];
      const successCount = results.filter((result, index) => {
        if (result.status === 'rejected') {
          failedTokens.push(validTokens[index]);
          const errorMsg = (result.reason as { message?: string })?.message || String(result.reason);
          console.warn(
            ` [PUSH NOTIFICATION] Failed to send to token ${validTokens[index]?.substring(0, 10)}...`,
            errorMsg
          );
          return false;
        }
        return true;
      }).length;

      console.log(` [PUSH NOTIFICATION] Sent to ${successCount}/${validTokens.length} tokens`);

      // Remove invalid/expired tokens from database
      if (failedTokens.length > 0) {
        await User.findByIdAndUpdate(
          payload.user,
          { $pull: { fcmToken: { $in: failedTokens } } },
          { new: true }
        );
        console.log(` [PUSH NOTIFICATION] Removed ${failedTokens.length} invalid token(s) from database`);
      }
    } else {
      // Single token handling
      const singleToken = user.fcmToken as string;
      const trimmedToken = singleToken?.trim();
      
      if (!trimmedToken) {
        console.log(' [PUSH NOTIFICATION] Invalid FCM token');
        return notification;
      }

      const message = {
        token: trimmedToken,
        notification: {
          title: payload.title,
          body: payload.description,
        },
        data: {
          type: payload.type,
          ...((payload.data as Record<string, string>) || {}),
        },
      };

      console.log(' [PUSH NOTIFICATION] Sending to single token');
      const result = await admin.messaging().send(message);
      console.log(' [PUSH NOTIFICATION] Single message sent successfully:', result);
    }

    return notification;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ [PUSH NOTIFICATION] Error sending notification:', errorMsg);
    // Don't rethrow - log and continue to prevent server crashes
    // Notification is already saved to DB, so it's safe to continue
    return null;
  }
};
