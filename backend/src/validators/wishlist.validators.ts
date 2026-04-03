import { z } from "zod";

export const addToWishlistSchema = z.object({
  body: z.object({
    productId: z.coerce.number().int().positive(),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const wishlistItemIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});
