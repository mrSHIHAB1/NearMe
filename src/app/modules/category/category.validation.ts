// import z from "zod";
// import { CategoryStatus } from "./category.interface";

// export const createCategoryZodSchema = z.object({
//   name: z
//     .string()
//     .min(2, { message: "Category name must be at least 2 characters" })
//     .max(50),

//   status: z
//     .enum(Object.values(CategoryStatus) as [string])
//     .optional(),
// });

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
 * Create Category Validation
 */
export const createCategoryZodSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters" })
    .max(100, { message: "Category name cannot exceed 100 characters" }),
  
  image: z
    .string()
    .optional(),

  parent: objectIdSchema.optional(),

  isCustom: z.boolean().optional(),
});

/**
 * Approve Category Validation (for admin)
 */
export const approveCategoryZodSchema = z.object({
  // no body needed, but keeping structure consistent
});