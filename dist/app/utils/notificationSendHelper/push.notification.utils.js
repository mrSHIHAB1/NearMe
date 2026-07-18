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
        console.log(' [PUSH NOTIFICATION] Attempting to send push notification:', {
            userId: payload.user,
            title: payload.title,
            description: payload.description,
            data: payload.data,
        });
        // Save in MongoDB
        const notification = yield notification_model_1.Notification.create(Object.assign({}, payload));
        console.log(' [PUSH NOTIFICATION] Saved to DB:', {
            notificationId: notification._id,
            type: notification.type,
            data: notification.data,
        });
        const user = yield user_model_1.User.findById(payload.user);
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
            const validTokens = user.fcmToken.filter((token) => token && typeof token === 'string' && token.trim().length > 0);
            if (validTokens.length === 0) {
                console.log(' [PUSH NOTIFICATION] No valid FCM tokens found');
                return notification;
            }
            console.log(' [PUSH NOTIFICATION] Sending to', validTokens.length, 'tokens');
            // Send to each token individually using allSettled to handle partial failures
            const sendPromises = validTokens.map(token => firebase_config_1.default.messaging().send({
                token: token.trim(),
                notification: {
                    title: payload.title,
                    body: payload.description,
                },
                data: Object.assign({ type: payload.type }, (payload.data || {})),
            }));
            const results = yield Promise.allSettled(sendPromises);
            // Track failed tokens for cleanup
            const failedTokens = [];
            const successCount = results.filter((result, index) => {
                var _a, _b;
                if (result.status === 'rejected') {
                    failedTokens.push(validTokens[index]);
                    const errorMsg = ((_a = result.reason) === null || _a === void 0 ? void 0 : _a.message) || String(result.reason);
                    console.warn(` [PUSH NOTIFICATION] Failed to send to token ${(_b = validTokens[index]) === null || _b === void 0 ? void 0 : _b.substring(0, 10)}...`, errorMsg);
                    return false;
                }
                return true;
            }).length;
            console.log(` [PUSH NOTIFICATION] Sent to ${successCount}/${validTokens.length} tokens`);
            // Remove invalid/expired tokens from database
            if (failedTokens.length > 0) {
                yield user_model_1.User.findByIdAndUpdate(payload.user, { $pull: { fcmToken: { $in: failedTokens } } }, { new: true });
                console.log(` [PUSH NOTIFICATION] Removed ${failedTokens.length} invalid token(s) from database`);
            }
        }
        else {
            // Single token handling
            const singleToken = user.fcmToken;
            const trimmedToken = singleToken === null || singleToken === void 0 ? void 0 : singleToken.trim();
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
                data: Object.assign({ type: payload.type }, (payload.data || {})),
            };
            console.log(' [PUSH NOTIFICATION] Sending to single token');
            const result = yield firebase_config_1.default.messaging().send(message);
            console.log(' [PUSH NOTIFICATION] Single message sent successfully:', result);
        }
        return notification;
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('❌ [PUSH NOTIFICATION] Error sending notification:', errorMsg);
        // Don't rethrow - log and continue to prevent server crashes
        // Notification is already saved to DB, so it's safe to continue
        return null;
    }
});
exports.sendPushAndSave = sendPushAndSave;
