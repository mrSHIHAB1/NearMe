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
exports.sendPushAndSave = void 0;
/* eslint-disable no-console */
const firebase_config_1 = __importDefault(require("../../config/firebase.config"));
const notification_model_1 = require("../../modules/notification/notification.model");
const user_model_1 = require("../../modules/user/user.model");
const sendPushAndSave = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Save in MongoDB
        const notification = yield notification_model_1.Notification.create(Object.assign({}, payload));
        const user = yield user_model_1.User.findById(payload.user);
        if (!user || !user.fcmToken)
            return;
        const receiverNotificationPreferences = yield notification_model_1.NotificationPreference.findOne({ user: payload.user });
        // IF USER ALLOWED PUSH NOTIFICATION
        if (receiverNotificationPreferences === null || receiverNotificationPreferences === void 0 ? void 0 : receiverNotificationPreferences.channel.push) {
            const message = {
                token: user.fcmToken,
                notification: {
                    title: payload.title,
                    body: payload.description,
                },
                data: payload.data || {}, // optional key-value pairs
            };
            const result = yield firebase_config_1.default.messaging().send(message); // Send notificaton via FCM
            console.log('Push sent: ', result);
        }
        return notification;
    }
    catch (err) {
        console.error('Error sending notification:', err);
    }
});
exports.sendPushAndSave = sendPushAndSave;
