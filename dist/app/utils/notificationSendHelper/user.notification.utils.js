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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPersonalNotification = void 0;
const socket_1 = require("../../socket");
const notification_model_1 = require("../../modules/notification/notification.model");
const sendPersonalNotification = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Save to DB (for offline support)
    const notification = yield notification_model_1.Notification.create(payload);
    const receiverNotificationPreferences = yield notification_model_1.NotificationPreference.findOne({
        user: payload.user,
    });
    if (receiverNotificationPreferences === null || receiverNotificationPreferences === void 0 ? void 0 : receiverNotificationPreferences.channel.inApp) {
        const userRoom = payload.user.toString();
        // Send real-time
        socket_1.io.to(userRoom).emit('notification', notification);
    }
});
exports.sendPersonalNotification = sendPersonalNotification;
