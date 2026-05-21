import z from "zod";

/**
 * Mongo ObjectId validation
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, {
    message: "Invalid MongoDB ObjectId",
  });

/**
 * Manual Subscription Creation Validation (for admin/superadmin)
 */
export const manualSubscriptionZodSchema = z.object({
  userId: objectIdSchema,
  planId: objectIdSchema,
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  autoRenew: z.boolean().optional(),
});

/**
 * Subscribe to Plan Validation
 */
export const subscribeToPlanZodSchema = z.object({
  planId: objectIdSchema,
});
