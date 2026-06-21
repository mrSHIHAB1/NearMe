"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeToPlanZodSchema = exports.manualSubscriptionZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
/**
 * Mongo ObjectId validation
 */
const objectIdSchema = zod_1.default
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, {
    message: "Invalid MongoDB ObjectId",
});
/**
 * Manual Subscription Creation Validation (for admin/superadmin)
 */
exports.manualSubscriptionZodSchema = zod_1.default.object({
    userId: objectIdSchema,
    planId: objectIdSchema,
    startDate: zod_1.default.string().datetime().optional(),
    endDate: zod_1.default.string().datetime().optional(),
    amount: zod_1.default.number().positive().optional(),
    currency: zod_1.default.string().optional(),
    autoRenew: zod_1.default.boolean().optional(),
});
/**
 * Subscribe to Plan Validation
 */
exports.subscribeToPlanZodSchema = zod_1.default.object({
    planId: objectIdSchema,
});
