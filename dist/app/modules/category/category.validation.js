"use strict";
// import z from "zod";
// import { CategoryStatus } from "./category.interface";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveCategoryZodSchema = exports.createCategoryZodSchema = void 0;
// export const createCategoryZodSchema = z.object({
//   name: z
//     .string()
//     .min(2, { message: "Category name must be at least 2 characters" })
//     .max(50),
//   status: z
//     .enum(Object.values(CategoryStatus) as [string])
//     .optional(),
// });
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
 * Create Category Validation
 */
exports.createCategoryZodSchema = zod_1.default.object({
    name: zod_1.default
        .string()
        .min(2, { message: "Category name must be at least 2 characters" })
        .max(100, { message: "Category name cannot exceed 100 characters" }),
    image: zod_1.default
        .string()
        .optional(),
    parent: objectIdSchema.optional(),
    isCustom: zod_1.default.boolean().optional(),
});
/**
 * Approve Category Validation (for admin)
 */
exports.approveCategoryZodSchema = zod_1.default.object({
// no body needed, but keeping structure consistent
});
