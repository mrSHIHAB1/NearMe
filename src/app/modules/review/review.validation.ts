import z from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createReviewZodSchema = z.object({
  service: z
    .string()
    .regex(objectIdRegex, { message: "Invalid Service ID" }),

  rating: z
    .number()
    .min(1)
    .max(5)
    .optional(),

  comment: z
    .string()
    .min(2)
    .max(500),

  parentReview: z
    .string()
    .regex(objectIdRegex)
    .optional()
});

export const replyReviewZodSchema = z.object({
  comment: z
    .string()
    .min(2)
    .max(500)
});