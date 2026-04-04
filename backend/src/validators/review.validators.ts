import { z } from "zod";

const ratingSchema = z.coerce
  .number()
  .int()
  .min(1, "Rating must be between 1 and 5")
  .max(5, "Rating must be between 1 and 5");

const reviewTextSchema = z
  .string()
  .trim()
  .min(10, "Review text must be at least 10 characters")
  .max(1000, "Review text cannot exceed 1000 characters");

export const productReviewsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    productId: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.coerce.number().int().positive(),
    rating: ratingSchema,
    reviewText: reviewTextSchema,
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const updateReviewSchema = z.object({
  body: z
    .object({
      rating: ratingSchema.optional(),
      reviewText: reviewTextSchema.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field must be provided",
    }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const reviewIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const moderationListSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    status: z.enum(["pending", "approved", "all"]).optional(),
    search: z.string().trim().optional(),
  }),
});

export const moderateReviewSchema = z.object({
  body: z.object({
    status: z.coerce.boolean(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});
