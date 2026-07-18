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
    console.log(' [SOCKET NOTIFICATION] User is online, sending real-time notification:', {
        userId: payload.user,
        title: payload.title,
        description: payload.description,
        data: payload.data,
    });
    // Save to DB (for offline support)
    const notification = yield notification_model_1.Notification.create(payload);
    console.log(' [SOCKET NOTIFICATION] Saved to DB:', {
        notificationId: notification._id,
        type: notification.type,
        data: notification.data,
    });
    const userRoom = payload.user.toString();
    // Send real-time notification
    socket_1.io.to(userRoom).emit('notification', notification);
    console.log('[SOCKET NOTIFICATION] Notification emitted to room:', userRoom);
});
exports.sendPersonalNotification = sendPersonalNotification;
