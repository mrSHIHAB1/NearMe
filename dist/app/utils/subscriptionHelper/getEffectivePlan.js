"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
exports.getEffectivePlan = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const plan_model_1 = require("../../modules/plan/plan.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const getActiveSubscription_1 = require("./getActiveSubscription");
const getEffectivePlan = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const activeSubscription = yield (0, getActiveSubscription_1.getActiveSubscription)(userId);
    if (activeSubscription === null || activeSubscription === void 0 ? void 0 : activeSubscription.plan) {
        return activeSubscription.plan;
    }
    const freePlan = yield plan_model_1.Plan.findOne({ name: "free", isActive: true });
    if (!freePlan) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Free plan not found. Please seed plans first.");
    }
    return freePlan;
});
exports.getEffectivePlan = getEffectivePlan;
