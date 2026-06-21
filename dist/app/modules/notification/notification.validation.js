"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationValidation = void 0;
const zod_1 = require("zod");
const channelSchema = zod_1.z.object({
    push: zod_1.z.boolean().optional(),
    email: zod_1.z.boolean().optional(),
    inApp: zod_1.z.boolean().optional(),
});
const eventSchema = zod_1.z.object({
    event_invitations: zod_1.z.boolean().optional(),
    event_changes: zod_1.z.boolean().optional(),
    event_reminders: zod_1.z.boolean().optional(),
});
const appSchema = zod_1.z.object({
    product_updates: zod_1.z.boolean().optional(),
    special_offers: zod_1.z.boolean().optional(),
});
// Validation for bulk update
const updateNotificationPreferencesSchema = zod_1.z.object({
    channel: channelSchema.optional(),
    directmsg: zod_1.z.boolean().optional(),
    app: appSchema.optional(),
    event: eventSchema.optional(),
});
// Validation for channel update
const updateNotificationChannelSchema = zod_1.z.object({
    channelType: zod_1.z.enum(['push', 'email', 'inApp']),
    value: zod_1.z.boolean(),
});
// Validation for event notification update
const updateEventNotificationsSchema = zod_1.z.object({
    eventType: zod_1.z.enum(['event_invitations', 'event_changes', 'event_reminders']),
    value: zod_1.z.boolean(),
});
// Validation for app notification update
const updateAppNotificationsSchema = zod_1.z.object({
    appType: zod_1.z.enum(['product_updates', 'special_offers']),
    value: zod_1.z.boolean(),
});
// Validation for direct message notification update
const updateDirectMessageNotificationSchema = zod_1.z.object({
    value: zod_1.z.boolean(),
});
exports.NotificationValidation = {
    updateNotificationPreferencesSchema,
    updateNotificationChannelSchema,
    updateEventNotificationsSchema,
    updateAppNotificationsSchema,
    updateDirectMessageNotificationSchema,
};
