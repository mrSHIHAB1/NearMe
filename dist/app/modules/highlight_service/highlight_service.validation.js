"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHighlightServiceZodSchema = exports.createHighlightServiceZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createHighlightServiceZodSchema = zod_1.default.object({
    service: zod_1.default
        .string(),
    title: zod_1.default
        .string()
        .min(2, { message: "Title must be at least 2 characters long" })
        .max(100, { message: "Title cannot exceed 100 characters" }),
    image: zod_1.default
        .string()
        .optional(),
    description: zod_1.default
        .string()
        .min(10, { message: "Description must be at least 10 characters long" })
        .max(500, { message: "Description cannot exceed 500 characters" }),
});
exports.updateHighlightServiceZodSchema = zod_1.default.object({
    title: zod_1.default
        .string()
        .min(2)
        .max(100)
        .optional(),
    image: zod_1.default
        .string()
        .url()
        .optional(),
    description: zod_1.default
        .string()
        .min(10)
        .max(500)
        .optional(),
});
