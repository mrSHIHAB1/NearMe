import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
    name: z.string()
        .min(1, { message: "Name is required" })
        .min(2, { message: "Name is too short. Minimum 2 character long" })
        .max(50, { message: "Name is too long" }),
    password: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/\d/, { message: "Password must contain at least one digit" })
        .regex(/[^A-Za-z0-9]/, {
            message: "Password must contain at least one special character",
        })
        .optional(),
    email: z.string()
        .email({ message: "Invalid email address" })
        .min(5, { message: "Email must be at least 5 characters long" })
        .max(100, { message: "Email cannot exceed 100 characters" }),
    phone: z.string()
        .regex(/^(\+8801|01)[3-9]\d{8}$/, {
            message:
                "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
    picture: z
        .string()
        .optional(),
    role: z
        // .enum(["PROVIDER", "USER", "SUPER_ADMIN"])
        .enum(Object.values(Role) as [string])
        .optional(),
    isActive: z
        .enum(Object.values(IsActive) as [string])
        .optional(),
    isDeleted: z
        .boolean()
        .optional()
        .refine(val => typeof val === "boolean" || val === undefined, {
            message: "isDeleted must be true or false",
        }),
    isVerified: z
        .boolean()
        .optional()
        .refine(val => typeof val === "boolean" || val === undefined, {
            message: "isVerified must be true or false",
        }),
    address: z.string()
        .min(1, { message: "Address is required" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(),
    fcmToken: z.string('FCM token must be in string type!').optional(),
    coord: z
        .object({
            lat: z.number(),
            lon: z.number(),
        })
        .optional()

})

export const updateUserZodSchema = z.object({
    name: z.string()
        .min(1, { message: "Name is required" })
        .min(2, { message: "Name is too short. Minimum 2 character long" })
        .max(50, { message: "Name is too long" })
        .optional(),
    password: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/\d/, { message: "Password must contain at least one digit" })
        .regex(/[^A-Za-z0-9]/, {
            message: "Password must contain at least one special character",
        })
        .optional(),
    phone: z.string()
        .regex(/^(\+8801|01)[3-9]\d{8}$/, {
            message:
                "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
    picture: z
        .string()
        .optional(),
    role: z
        // .enum(["PROVIDER", "USER", "SUPER_ADMIN"])
        .enum(Object.values(Role) as [string])
        .optional(),
    isActive: z
        .enum(Object.values(IsActive) as [string])
        .optional(),
    isDeleted: z
        .boolean()
        .optional()
        .refine(val => typeof val === "boolean" || val === undefined, {
            message: "isDeleted must be true or false",
        }),
    isVerified: z
        .boolean()
        .optional()
        .refine(val => typeof val === "boolean" || val === undefined, {
            message: "isVerified must be true or false",
        }),
    otp: z
        .string("OTP type should be string!")
        .optional(),
    address: z.string()
        .min(1, { message: "Address is required" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(),
    coord: z
        .object({
            lat: z.number(),
            lon: z.number(),
        })
        .optional()

})

export const verifyOtpZodSchema = z.object({
    otp: z
        .string("OTP type should be string!")
        .optional(),
    email: z.string()
        .email({ message: "Invalid email address" })
        .min(5, { message: "Email must be at least 5 characters long" })
        .max(100, { message: "Email cannot exceed 100 characters" }),

})