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
exports.enforceOfferServicesLimit = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const getEffectivePlan_1 = require("./getEffectivePlan");
const enforceOfferServicesLimit = (userId, offerServicesCount) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield (0, getEffectivePlan_1.getEffectivePlan)(userId);
    const limit = plan.features.maxOfferServices;
    if (limit !== -1 && offerServicesCount > limit) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `Your current plan allows maximum ${limit} offered services`);
    }
});
exports.enforceOfferServicesLimit = enforceOfferServicesLimit;
