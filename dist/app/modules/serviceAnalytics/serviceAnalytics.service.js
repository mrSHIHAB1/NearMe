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
exports.ServiceAnalyticsService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const serviceAnalytics_model_1 = require("./serviceAnalytics.model");
const service_model_1 = require("../service/service.model");
const plan_model_1 = require("../plan/plan.model");
const user_model_1 = require("../user/user.model");
const mongoose_1 = require("mongoose");
// ─── Helpers ──────────────────────────────────────────────────────────────────
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/**
 * Builds weekly chart data (last 7 days, grouped by day-of-week label).
 */
const buildWeeklyChart = (serviceId, type) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const raw = yield serviceAnalytics_model_1.ServiceAnalytics.aggregate([
        {
            $match: {
                service: serviceId,
                type,
                createdAt: { $gte: sevenDaysAgo },
            },
        },
        {
            $group: {
                _id: { $dayOfWeek: '$createdAt' }, // 1=Sun ... 7=Sat
                count: { $sum: 1 },
            },
        },
    ]);
    const countMap = new Map(raw.map((r) => [r._id, r.count]));
    // Build last 7 days in order
    const result = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dayOfWeek = d.getDay() + 1; // getDay() returns 0-6, $dayOfWeek returns 1-7
        result.push({
            label: WEEK_DAYS[d.getDay()],
            count: countMap.get(dayOfWeek) || 0,
        });
    }
    return result;
});
/**
 * Builds yearly chart data (current year, grouped by month).
 */
const buildYearlyChart = (serviceId, type) => __awaiter(void 0, void 0, void 0, function* () {
    const currentYear = new Date().getFullYear();
    const raw = yield serviceAnalytics_model_1.ServiceAnalytics.aggregate([
        {
            $match: {
                service: serviceId,
                type,
                createdAt: {
                    $gte: new Date(`${currentYear}-01-01`),
                    $lte: new Date(`${currentYear}-12-31T23:59:59`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' }, // 1=Jan ... 12=Dec
                count: { $sum: 1 },
            },
        },
    ]);
    const countMap = new Map(raw.map((r) => [r._id, r.count]));
    return MONTHS.map((label, idx) => ({
        label,
        count: countMap.get(idx + 1) || 0,
    }));
});
// ─── Track ────────────────────────────────────────────────────────────────────
/**
 * Records a single view or impression event for a service.
 * Called by the frontend when a service is rendered (impression) or opened (view).
 */
const trackEvent = (serviceId, type, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const service = yield service_model_1.Service.findById(serviceId);
    if (!service) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Service not found');
    }
    yield serviceAnalytics_model_1.ServiceAnalytics.create(Object.assign({ service: new mongoose_1.Types.ObjectId(serviceId), type }, (userId ? { user: new mongoose_1.Types.ObjectId(userId) } : {})));
    return { tracked: true };
});
// ─── Dashboard ────────────────────────────────────────────────────────────────
/**
 * Returns analytics data for the authenticated provider's service.
 * Data returned depends on the provider's plan analyticsType:
 *   - "none"     → everything locked
 *   - "basic"    → impressions only (total + weekly chart)
 *   - "detailed" → impressions + views (totals + charts)
 */
const getDashboardAnalytics = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, impressionPeriod = 'week', 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
viewPeriod = 'year') {
    var _a, _b;
    // 1. Find the provider's service
    const service = yield service_model_1.Service.findOne({ provider: userId }).select('_id');
    if (!service) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'No service found for this provider');
    }
    // 2. Resolve the provider's current plan analyticsType
    const user = yield user_model_1.User.findById(userId).select('subscriptionInfo').lean();
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'User not found');
    }
    const planName = ((_a = user === null || user === void 0 ? void 0 : user.subscriptionInfo) === null || _a === void 0 ? void 0 : _a.planName) || 'free';
    const plan = yield plan_model_1.Plan.findOne({ name: planName }).select('features.analyticsType').lean();
    const analyticsType = ((_b = plan === null || plan === void 0 ? void 0 : plan.features) === null || _b === void 0 ? void 0 : _b.analyticsType) || 'none';
    // 3. Build response based on plan
    // impressions: available for any non-'none' analytics type
    // views: available for 'detailed' and 'advanced'
    const locked = {
        impressions: analyticsType === 'none',
        views: !(analyticsType === 'detailed' || analyticsType === 'advanced'),
    };
    const serviceId = service._id;
    // 4. Fetch impression data (available for "basic", "detailed" and "advanced")
    let totalImpressions = null;
    let impressionChart = null;
    if (analyticsType === 'basic' || analyticsType === 'detailed' || analyticsType === 'advanced') {
        totalImpressions = yield serviceAnalytics_model_1.ServiceAnalytics.countDocuments({
            service: serviceId,
            type: 'impression',
        });
        impressionChart =
            impressionPeriod === 'week'
                ? yield buildWeeklyChart(serviceId, 'impression')
                : yield buildYearlyChart(serviceId, 'impression');
    }
    // 5. Fetch view data (available for "detailed" and "advanced")
    let totalViews = null;
    let viewChart = null;
    if (analyticsType === 'detailed' || analyticsType === 'advanced') {
        totalViews = yield serviceAnalytics_model_1.ServiceAnalytics.countDocuments({
            service: serviceId,
            type: 'view',
        });
        viewChart = yield buildYearlyChart(serviceId, 'view');
    }
    return {
        totalImpressions,
        totalViews,
        impressionChart,
        viewChart,
        locked,
        analyticsType,
    };
});
exports.ServiceAnalyticsService = {
    trackEvent,
    getDashboardAnalytics,
};
