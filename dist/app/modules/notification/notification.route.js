"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("./notification.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const checkAuth_1 = require("../../middlewares/checkAuth");
const notification_validation_1 = require("./notification.validation");
const user_interface_1 = require("../user/user.interface");
const router = express_1.default.Router();
// Get user's notification preferences
router.get('/preferences', (0, checkAuth_1.checkAuth)(), notification_controller_1.NotificationController.getUserNotificationPreferences);
// Update notification preferences (bulk update)
router.patch('/preferences', (0, checkAuth_1.checkAuth)(), (0, validateRequest_1.validateRequest)(notification_validation_1.NotificationValidation.updateNotificationPreferencesSchema), notification_controller_1.NotificationController.updateNotificationPreferences);
router.get('/my_notifications', (0, checkAuth_1.checkAuth)(...Object.keys(user_interface_1.Role)), notification_controller_1.NotificationController.getUserNotifications);
router.post('/send_system_notification', (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), notification_controller_1.NotificationController.sendSystemNotification);
exports.notificationRouter = router;
