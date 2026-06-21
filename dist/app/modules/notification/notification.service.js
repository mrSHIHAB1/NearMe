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
exports.NotificationService = {
    getUserNotificationPreferences,
    updateNotificationPreferences,
    getUsersNotificationService,
    sendSystemNotificationService,
};
