import z from "zod";

/**
 * Mongo ObjectId validation
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ObjectId format" });

  /**
 * Subscription Status Enum
 */
const subscriptionStatusEnum = z.enum(["active", "inactive", "expired"]);

/**
 * Location Validation
 */
const locationZodSchema = z.object({
  type: z.literal("Point"),

  coordinates: z
    .array(z.number())
    .length(2, { message: "Coordinates must contain [longitude, latitude]" })
    .refine(
      ([lng, lat]) =>
        lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
      { message: "Invalid longitude or latitude values" }
    ),

  address: z
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
const phoneSchema = z
  .string()
  .regex(/^(\+8801|01)[3-9]\d{8}$/, {
    message:
      "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
  });

/**
 * Create Service Validation
 */
export const createServiceZodSchema = z.object({
  service_name: z
    .string()
    .min(2, { message: "Service name must be at least 2 characters long" })
    .max(100),

  service_category: objectIdSchema,

  offer_services: z
    .array(objectIdSchema)
    .min(1, { message: "At least one offered service is required" }),

  phone: phoneSchema,

  service_address: z
    .string()
    .min(5, { message: "Service address is required" })
    .max(200),

  about: z
    .string()
    .min(10, { message: "About must be at least 10 characters long" })
    .max(1000),

  website_link: z
    .string()
    .url({ message: "Invalid website URL" }),

  location: locationZodSchema,

  media: z.array(z.string()).optional(),

  company_logo: z.string().optional(),

  openingTime: z
    .string()
    .regex(timeRegex, { message: "Opening time must be in HH:mm format" }),

  closingTime: z
    .string()
    .regex(timeRegex, { message: "Closing time must be in HH:mm format" }),

  allTimeAvailability: z.boolean(),

  // ── Subscription fields (OPTIONAL on create) ──
  activePlan: objectIdSchema.optional(),

  subscriptionStatus: subscriptionStatusEnum.optional(),

  subscriptionExpiresAt: z
    .union([z.string().datetime(), z.date()])
    .nullable()
    .optional(),
});

/**
 * Update Service Validation (ALL OPTIONAL)
 */
export const updateServiceZodSchema = z.object({
  service_name: z.string().min(2).max(100).optional(),

  service_category: objectIdSchema.optional(),

  offer_services: z.array(objectIdSchema).optional(),

  phone: phoneSchema.optional(),

  service_address: z.string().max(200).optional(),

  about: z.string().max(1000).optional(),

  website_link: z
    .string()
    .url({ message: "Invalid website URL" })
    .optional(),

  location: locationZodSchema.optional(),

  media: z.array(z.string()).optional(),

  company_logo: z.string().optional(),

  openingTime: z
    .string()
    .regex(timeRegex, { message: "Opening time must be in HH:mm format" })
    .optional(),

  closingTime: z
    .string()
    .regex(timeRegex, { message: "Closing time must be in HH:mm format" })
    .optional(),

  allTimeAvailability: z.boolean().optional(),
});