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
exports.SubscriptionController = void 0;
const subscription_service_1 = require("./subscription.service");
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const getMyCurrentSubscription = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield subscription_service_1.SubscriptionService.getMyCurrentSubscription(user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Current subscription retrieved successfully",
        data: result,
    });
}));
const getMySubscriptionHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield subscription_service_1.SubscriptionService.getMySubscriptionHistory(user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Subscription history retrieved successfully",
        data: result,
    });
}));
const subscribeToPlan = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { planId } = req.body;
    const result = yield subscription_service_1.SubscriptionService.subscribeToPlan(user.userId, planId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Subscription activated successfully",
        data: result,
    });
}));
const cancelMySubscription = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield subscription_service_1.SubscriptionService.cancelMySubscription(user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Subscription cancelled successfully",
        data: result,
    });
}));
const createManualSubscription = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, planId, startDate, endDate, amount, currency, autoRenew } = req.body;
    const result = yield subscription_service_1.SubscriptionService.createManualSubscription(userId, planId, {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        amount,
        currency,
        autoRenew,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: "Subscription created successfully",
        data: result,
    });
}));
exports.SubscriptionController = {
    getMyCurrentSubscription,
    getMySubscriptionHistory,
    subscribeToPlan,
    cancelMySubscription,
    createManualSubscription,
};
