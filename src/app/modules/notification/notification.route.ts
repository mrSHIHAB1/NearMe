import express from 'express';
import { NotificationController } from './notification.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { checkAuth } from '../../middlewares/checkAuth';
import { NotificationValidation } from './notification.validation';
import { Role } from '../user/user.interface';

const router = express.Router();

// Get user's notification preferences
router.get(
  '/preferences',
  checkAuth(),
  NotificationController.getUserNotificationPreferences
);

// Update notification preferences (bulk update)
router.patch(
  '/preferences',
  checkAuth(),
  validateRequest(NotificationValidation.updateNotificationPreferencesSchema),
  NotificationController.updateNotificationPreferences
);

router.get(
  '/my_notifications',
  checkAuth(...Object.keys(Role)),
  NotificationController.getUserNotifications
);

router.post(
  '/send_system_notification',
  checkAuth(Role.SUPER_ADMIN),
  NotificationController.sendSystemNotification
);

// Mark as seen
router.patch(
  '/:id/mark_seen',
  checkAuth(...Object.keys(Role)),
  NotificationController.markNotificationAsSeen
);

// Delete notification
router.delete('/:id', checkAuth(...Object.keys(Role)), NotificationController.deleteNotification);

// Test push notification
router.post(
  '/test-push',
  checkAuth(Role.SUPER_ADMIN),
  NotificationController.sendTestPush
);

export const notificationRouter = router;
