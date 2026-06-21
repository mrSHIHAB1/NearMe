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
exports.requireSubscriptionFeature = void 0;
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const getEffectivePlan_1 = require("../utils/subscriptionHelper/getEffectivePlan");
const requireSubscriptionFeature = (featureKey) => {
    return (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const user = req.user;
        if (!(user === null || user === void 0 ? void 0 : user._id)) {
            return next(new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "User not authenticated"));
        }
        const plan = yield (0, getEffectivePlan_1.getEffectivePlan)(user._id);
        const value = (_a = plan === null || plan === void 0 ? void 0 : plan.features) === null || _a === void 0 ? void 0 : _a[featureKey];
        if (!value) {
            return next(new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This feature is not available in your current plan"));
        }
        next();
    });
};
exports.requireSubscriptionFeature = requireSubscriptionFeature;
