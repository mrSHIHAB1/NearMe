"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpZodSchema = exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default.string()
        .min(1, { message: "Name is required" })
        .min(2, { message: "Name is too short. Minimum 2 character long" })
        .max(50, { message: "Name is too long" }),
    password: zod_1.default.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/\d/, { message: "Password must contain at least one digit" })
        .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
    })
        .optional(),
    email: zod_1.default.string()
        .email({ message: "Invalid email address" })
        .min(5, { message: "Email must be at least 5 characters long" })
        .max(100, { message: "Email cannot exceed 100 characters" }),
    phone: zod_1.default.string().optional(),
    picture: zod_1.default
        .string()
        .optional(),
    role: zod_1.default
        // .enum(["PROVIDER", "USER", "SUPER_ADMIN"])
        .enum(Object.values(user_interface_1.Role))
        .optional(),
    isActive: zod_1.default
        .enum(Object.values(user_interface_1.IsActive))
        .optional(),
    isDeleted: zod_1.default
        .boolean()
        .optional()
        .refine(val => typeof val === "boolean" || val === undefined, {
        message: "isDeleted must be true or false",
    }),
    isVerified: zod_1.default
        .boolean()
        .optional()
        .refine(val => typeof val === "boolean" || val === undefined, {
        message: "isVerified must be true or false",
    }),
    address: zod_1.default.string()
        .min(1, { message: "Address is required" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(),
    fcmToken: zod_1.default.string('FCM token must be in string type!').optional(),
    coord: zod_1.default
        .object({
        lat: zod_1.default.number(),
        lon: zod_1.default.number(),
    })
        .optional()
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default.string()
        .min(1, { message: "Name is required" })
        .min(2, { message: "Name is too short. Minimum 2 character long" })
        .max(50, { message: "Name is too long" })
        .optional(),
    password: zod_1.default.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/\d/, { message: "Password must contain at least one digit" })
        .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
    })
        .optional(),
    phone: zod_1.default.string()
        .regex(/^(\+8801|01)[3-9]\d{8}$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    picture: zod_1.default
        .string()
        .optional(),
    role: zod_1.default
        // .enum(["PROVIDER", "USER", "SUPER_ADMIN"])
        .enum(Object.values(user_interface_1.Role))
        .optional(),
    isActive: zod_1.default
        .enum(Object.values(user_interface_1.IsActive))
        .optional(),
    isDeleted: zod_1.default
        .boolean()
        .optional()
        .refine(val => typeof val === "boolean" || val === undefined, {
        message: "isDeleted must be true or false",
    }),
    isVerified: zod_1.default
        .boolean()
        .optional()
        .refine(val => typeof val === "boolean" || val === undefined, {
        message: "isVerified must be true or false",
    }),
    otp: zod_1.default
        .string("OTP type should be string!")
        .optional(),
    address: zod_1.default.string()
        .min(1, { message: "Address is required" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(),
    coord: zod_1.default
        .object({
        lat: zod_1.default.number(),
        lon: zod_1.default.number(),
    })
        .optional()
});
exports.verifyOtpZodSchema = zod_1.default.object({
    otp: zod_1.default
        .string("OTP type should be string!")
        .optional(),
    email: zod_1.default.string()
        .email({ message: "Invalid email address" })
        .min(5, { message: "Email must be at least 5 characters long" })
        .max(100, { message: "Email cannot exceed 100 characters" }),
});
