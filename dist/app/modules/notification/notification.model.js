"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreference = exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notification_interface_1 = require("./notification.interface");
const notificationSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user' },
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user' },
    chatId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user' },
    receiverIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'user' }],
    type: {
        type: String,
        required: true,
        enum: [...Object.values(notification_interface_1.NotificationType)],
    },
    title: { type: String, required: true },
    description: { type: String },
    data: { type: Object },
    isRead: { type: Boolean, default: false },
}, {
    timestamps: true,
    versionKey: false,
});
const notificationPreferenceSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user', required: true },
    channel: {
        push: { type: Boolean, default: false },
        email: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
    },
    directmsg: { type: Boolean, default: true },
    app: {
        product_updates: { type: Boolean, default: true },
        special_offers: { type: Boolean, default: true },
    },
    event: {
        event_invitations: { type: Boolean, default: true },
        event_changes: { type: Boolean, default: true },
        event_reminders: { type: Boolean, default: true },
    },
}, {
    timestamps: true,
    versionKey: false,
});
// Indexing for faster loading
notificationSchema.index({ user: 1, createdAt: -1 });
exports.Notification = (0, mongoose_1.model)('Notification', notificationSchema);
exports.NotificationPreference = (0, mongoose_1.model)('NotificationPreference', notificationPreferenceSchema);
