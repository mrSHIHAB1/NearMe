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
exports.NotificationController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const notification_service_1 = require("./notification.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
// Get user's notification preferences (using)
const getUserNotificationPreferences = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user === null || user === void 0 ? void 0 : user.userId;
    const result = yield notification_service_1.NotificationService.getUserNotificationPreferences(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'Notification preferences retrieved successfully',
        data: result,
    });
}));
// Update notification preferences (bulk update) (using)
const updateNotificationPreferences = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user === null || user === void 0 ? void 0 : user.userId;
    const payload = req.body;
    const result = yield notification_service_1.NotificationService.updateNotificationPreferences(userId, payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'Notification preferences updated successfully',
        data: result,
    });
}));
// Get user's notification preferences (using)
const getUserNotifications = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const query = req.query;
    const result = yield notification_service_1.NotificationService.getUsersNotificationService(userId, query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'Notification retrieved successfully',
        data: result,
    });
}));
// Get user's notification preferences (using)
const sendSystemNotification = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const paylod = req.body;
    const result = yield notification_service_1.NotificationService.sendSystemNotificationService(paylod);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'Notification retrieved successfully',
        data: result,
    });
}));
exports.NotificationController = {
    getUserNotificationPreferences,
    updateNotificationPreferences,
    getUserNotifications,
    sendSystemNotification,
};
