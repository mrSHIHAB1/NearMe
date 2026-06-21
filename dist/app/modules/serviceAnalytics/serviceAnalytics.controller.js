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
exports.ServiceAnalyticsController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const serviceAnalytics_service_1 = require("./serviceAnalytics.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
/**
 * POST /analytics/track
 * Body: { serviceId: string, type: 'view' | 'impression' }
 * Auth: optional (pass userId if logged in, skip if anonymous)
 */
const trackEvent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { serviceId, type } = req.body;
    if (!serviceId || !type) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'serviceId and type are required');
    }
    if (!['view', 'impression'].includes(type)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'type must be "view" or "impression"');
    }
    // userId is optional — anonymous users can still generate analytics events
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const result = yield serviceAnalytics_service_1.ServiceAnalyticsService.trackEvent(serviceId, type, userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'Event tracked successfully',
        data: result,
    });
}));
/**
 * GET /analytics/dashboard?impressionPeriod=week&viewPeriod=year
 * Auth: required (provider only)
 */
const getDashboardAnalytics = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const impressionPeriod = req.query.impressionPeriod || 'week';
    const viewPeriod = req.query.viewPeriod || 'year';
    const data = yield serviceAnalytics_service_1.ServiceAnalyticsService.getDashboardAnalytics(user.userId, impressionPeriod, viewPeriod);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Dashboard analytics retrieved successfully',
        data,
    });
}));
exports.ServiceAnalyticsController = {
    trackEvent,
    getDashboardAnalytics,
};
