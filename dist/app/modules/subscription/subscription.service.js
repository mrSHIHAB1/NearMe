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
exports.SubscriptionService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const plan_model_1 = require("../plan/plan.model");
const subscription_model_1 = require("./subscription.model");
const getActiveSubscription_1 = require("../../utils/subscriptionHelper/getActiveSubscription");
const getEffectivePlan_1 = require("../../utils/subscriptionHelper/getEffectivePlan");
const syncUserSubscriptionInfo_1 = require("../../utils/subscriptionHelper/syncUserSubscriptionInfo");
const getMyCurrentSubscription = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const activeSubscription = yield (0, getActiveSubscription_1.getActiveSubscription)(userId);
    if (activeSubscription) {
        return activeSubscription;
    }
    const freePlan = yield (0, getEffectivePlan_1.getEffectivePlan)(userId);
    return {
        isDefaultFreePlan: true,
        status: "active",
        plan: freePlan,
        startDate: null,
        endDate: null,
        autoRenew: false,
        amount: freePlan.price,
        currency: freePlan.currency,
    };
});
const getMySubscriptionHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscription_model_1.Subscription.find({ user: userId })
        .populate("plan")
        .sort({ createdAt: -1 });
    return result;
});
// temporary manual activation flow
// later this function can be replaced by payment success webhook logic
const subscribeToPlan = (userId, planId) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield plan_model_1.Plan.findById(planId);
    if (!plan || !plan.isActive) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Plan not found");
    }
    if (plan.name === "free") {
        yield (0, syncUserSubscriptionInfo_1.syncUserSubscriptionInfo)(userId);
        return {
            message: "Free plan applied successfully",
            plan,
        };
    }
    const activeSubscription = yield subscription_model_1.Subscription.findOne({
        user: userId,
        isCurrent: true,
    });
    if (activeSubscription) {
        activeSubscription.isCurrent = false;
        if (activeSubscription.status === "active") {
            activeSubscription.status = "cancelled";
        }
        yield activeSubscription.save();
    }
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    const newSubscription = yield subscription_model_1.Subscription.create({
        user: userId,
        plan: plan._id,
        status: "active",
        startDate,
        endDate,
        autoRenew: false,
        amount: plan.price,
        currency: plan.currency,
        paymentMethod: "manual",
        paymentGateway: "manual",
        transactionId: `manual_${Date.now()}`,
        isCurrent: true,
    });
    yield (0, syncUserSubscriptionInfo_1.syncUserSubscriptionInfo)(userId);
    return yield subscription_model_1.Subscription.findById(newSubscription._id).populate("plan");
});
const cancelMySubscription = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const activeSubscription = yield subscription_model_1.Subscription.findOne({
        user: userId,
        status: "active",
        isCurrent: true,
    });
    if (!activeSubscription) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "No active subscription found");
    }
    activeSubscription.status = "cancelled";
    activeSubscription.isCurrent = false;
    yield activeSubscription.save();
    yield (0, syncUserSubscriptionInfo_1.syncUserSubscriptionInfo)(userId);
    return activeSubscription;
});
// Manual subscription creation by admin/superadmin
const createManualSubscription = (userId, planId, subscriptionData) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify plan exists and is active
    const plan = yield plan_model_1.Plan.findById(planId);
    if (!plan || !plan.isActive) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Plan not found or is inactive");
    }
    // Handle free plan
    if (plan.name === "free") {
        yield (0, syncUserSubscriptionInfo_1.syncUserSubscriptionInfo)(userId);
        return {
            message: "Free plan applied successfully",
            plan,
        };
    }
    // Mark previous subscription as cancelled if exists
    const activeSubscription = yield subscription_model_1.Subscription.findOne({
        user: userId,
        isCurrent: true,
    });
    if (activeSubscription) {
        activeSubscription.isCurrent = false;
        if (activeSubscription.status === "active") {
            activeSubscription.status = "cancelled";
        }
        yield activeSubscription.save();
    }
    // Set default dates
    const startDate = (subscriptionData === null || subscriptionData === void 0 ? void 0 : subscriptionData.startDate) || new Date();
    const endDate = (subscriptionData === null || subscriptionData === void 0 ? void 0 : subscriptionData.endDate) || new Date(startDate);
    if (!(subscriptionData === null || subscriptionData === void 0 ? void 0 : subscriptionData.endDate)) {
        endDate.setMonth(endDate.getMonth() + 1);
    }
    // Create new subscription
    const newSubscription = yield subscription_model_1.Subscription.create({
        user: userId,
        plan: plan._id,
        status: "active",
        startDate,
        endDate,
        autoRenew: (subscriptionData === null || subscriptionData === void 0 ? void 0 : subscriptionData.autoRenew) || false,
        amount: (subscriptionData === null || subscriptionData === void 0 ? void 0 : subscriptionData.amount) || plan.price,
        currency: (subscriptionData === null || subscriptionData === void 0 ? void 0 : subscriptionData.currency) || plan.currency,
        paymentMethod: "manual",
        paymentGateway: "manual_admin",
        transactionId: `manual_admin_${Date.now()}`,
        isCurrent: true,
    });
    yield (0, syncUserSubscriptionInfo_1.syncUserSubscriptionInfo)(userId);
    return yield subscription_model_1.Subscription.findById(newSubscription._id).populate("plan");
});
exports.SubscriptionService = {
    getMyCurrentSubscription,
    getMySubscriptionHistory,
    subscribeToPlan,
    cancelMySubscription,
    createManualSubscription,
};
