"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const notification_interface_1 = require("./notification.interface");
const notification_model_1 = require("./notification.model");
const socket_1 = require("../../socket");
const firebase_config_1 = __importDefault(require("../../config/firebase.config"));
// Get user's notification preferences (using)
const getUserNotificationPreferences = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const preferences = yield notification_model_1.NotificationPreference.findOne({ user: userId });
    if (!preferences) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Notification preferences not found');
    }
    return preferences;
});
// Update notification preferences (using)
const updateNotificationPreferences = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const preferences = yield notification_model_1.NotificationPreference.findOne({ user: userId });
    if (!preferences) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Notification preferences not found');
    }
    const updatedPreferences = yield notification_model_1.NotificationPreference.findOneAndUpdate({ user: userId }, payload, { new: true, runValidators: true });
    return updatedPreferences;
});
// Get user's notification
const getUsersNotificationService = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = query.sort || '-createdAt';
    const notifications = yield notification_model_1.Notification.find({
        $or: [
            { user: userId },
            { receiverIds: [userId] },
            { type: notification_interface_1.NotificationType.SYSTEM },
        ],
    })
        .select('_id user eventId chatId receiverIds type title description data isRead createdAt')
        .skip(skip)
        .limit(limit)
        .sort(sort);
    return notifications;
});
// SAVE SYSTEM NOTIFICATION FOR ALL USER'S
const sendSystemNotificationService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const notificationPayload = {
        title: payload.title,
        description: payload.description,
        type: payload.type,
    };
    const notify_users = yield notification_model_1.Notification.create(notificationPayload);
    socket_1.io.emit('notification', notify_users);
    return null;
});
// Mark a notification as seen/read by the user
const markNotificationAsSeen = (userId, notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notification_model_1.Notification.findOneAndUpdate({
        _id: notificationId,
        $or: [{ user: userId }, { receiverIds: [userId] }],
    }, { isRead: true }, { new: true });
    if (!notification) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Notification not found');
    }
    // emit update via socket if needed
    socket_1.io.to(userId).emit('notification_updated', notification);
    return notification;
});
// Delete a notification for the user
const deleteNotificationService = (userId, notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notification_model_1.Notification.findOneAndDelete({
        _id: notificationId,
        $or: [{ user: userId }, { receiverIds: [userId] }],
    });
    if (!notification) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Notification not found');
    }
    socket_1.io.to(userId).emit('notification_deleted', { id: notificationId });
    return null;
});
const sendTestPush = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'FCM token is required');
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
        const response = yield firebase_config_1.default.messaging().send(message);
        console.log('Successfully sent message:', response);
        return response;
    }
    catch (error) {
        console.error('Error sending message:', error);
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, 'Failed to send push notification');
    }
});
exports.NotificationService = {
    getUserNotificationPreferences,
    updateNotificationPreferences,
    getUsersNotificationService,
    sendSystemNotificationService,
    markNotificationAsSeen,
    deleteNotificationService,
    sendTestPush,
};
