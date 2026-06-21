"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyReviewZodSchema = exports.createReviewZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
exports.createReviewZodSchema = zod_1.default.object({
    service: zod_1.default
        .string()
        .regex(objectIdRegex, { message: "Invalid Service ID" }),
    rating: zod_1.default
        .number()
        .min(1)
        .max(5)
        .optional(),
    comment: zod_1.default
        .string()
        .min(2)
        .max(500),
    parentReview: zod_1.default
        .string()
        .regex(objectIdRegex)
        .optional()
});
exports.replyReviewZodSchema = zod_1.default.object({
    comment: zod_1.default
        .string()
        .min(2)
        .max(500)
});
