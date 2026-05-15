import z from "zod";

export const createHighlightServiceZodSchema = z.object({
  service: z
    .string()
    .min(1, { message: "Service ID is required" }),

  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters long" })
    .max(100, { message: "Title cannot exceed 100 characters" }),

  image: z
    .string()
    .optional(),
    
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" })
    .max(500, { message: "Description cannot exceed 500 characters" }),
});

export const updateHighlightServiceZodSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(100)
    .optional(),

  image: z
    .string()
    .url()
    .optional(),

  description: z
    .string()
    .min(10)
    .max(500)
    .optional(),
});