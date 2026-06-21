"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceZodSchema = exports.createServiceZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
/**
 * Mongo ObjectId validation
 */
const objectIdSchema = zod_1.default
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ObjectId format" });
/**
* Subscription Status Enum
*/
const subscriptionStatusEnum = zod_1.default.enum(["active", "inactive", "expired"]);
/**
 * Location Validation
 */
const locationZodSchema = zod_1.default.object({
    type: zod_1.default.literal("Point"),
    coordinates: zod_1.default
        .array(zod_1.default.number())
        .length(2, { message: "Coordinates must contain [longitude, latitude]" })
        .refine(([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90, { message: "Invalid longitude or latitude values" }),
    address: zod_1.default
        .string()
        .max(200, { message: "Address cannot exceed 200 characters" })
        .optional(),
});
/**
 * Time format validation (HH:mm)
 */
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
/**
 * Phone validation (BD)
 */
const phoneSchema = zod_1.default
    .string()
    .regex(/^(\+8801|01)[3-9]\d{8}$/, {
    message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
});
/**
 * Create Service Validation
 */
exports.createServiceZodSchema = zod_1.default.object({
    service_name: zod_1.default
        .string()
        .min(2, { message: "Service name must be at least 2 characters long" })
        .max(100),
    service_category: objectIdSchema,
    service_subCategory: objectIdSchema.optional(),
    service_childCategory: objectIdSchema.optional(),
    offer_services: zod_1.default
        .array(objectIdSchema)
        .min(1, { message: "At least one offered service is required" }),
    phone: phoneSchema,
    service_address: zod_1.default
        .string()
        .min(5, { message: "Service address is required" })
        .max(200),
    about: zod_1.default
        .string()
        .min(10, { message: "About must be at least 10 characters long" })
        .max(1000),
    website_link: zod_1.default
        .string()
        .url({ message: "Invalid website URL" }),
    location: locationZodSchema,
    media: zod_1.default.array(zod_1.default.string()).optional(),
    company_logo: zod_1.default.string().optional(),
    openingTime: zod_1.default
        .string()
        .regex(timeRegex, { message: "Opening time must be in HH:mm format" }),
    closingTime: zod_1.default
        .string()
        .regex(timeRegex, { message: "Closing time must be in HH:mm format" }),
    allTimeAvailability: zod_1.default.boolean(),
    // ── Plan Selection (REQUIRED on create) ──
    planId: zod_1.default.string(),
    // ── Subscription fields (OPTIONAL on create) ──
    activePlan: objectIdSchema.optional(),
    subscriptionStatus: subscriptionStatusEnum.optional(),
    subscriptionExpiresAt: zod_1.default
        .union([zod_1.default.string().datetime(), zod_1.default.date()])
        .nullable()
        .optional(),
});
/**
 * Update Service Validation (ALL OPTIONAL)
 */
exports.updateServiceZodSchema = zod_1.default.object({
    service_name: zod_1.default.string().min(2).max(100).optional(),
    service_category: objectIdSchema.optional(),
    service_subCategory: objectIdSchema.optional(),
    service_childCategory: objectIdSchema.optional(),
    offer_services: zod_1.default.array(objectIdSchema).optional(),
    phone: phoneSchema.optional(),
    service_address: zod_1.default.string().max(200).optional(),
    about: zod_1.default.string().max(1000).optional(),
    website_link: zod_1.default
        .string()
        .url({ message: "Invalid website URL" })
        .optional(),
    location: locationZodSchema.optional(),
    media: zod_1.default.array(zod_1.default.string()).optional(),
    company_logo: zod_1.default.string().optional(),
    openingTime: zod_1.default
        .string()
        .regex(timeRegex, { message: "Opening time must be in HH:mm format" })
        .optional(),
    closingTime: zod_1.default
        .string()
        .regex(timeRegex, { message: "Closing time must be in HH:mm format" })
        .optional(),
    allTimeAvailability: zod_1.default.boolean().optional(),
});
