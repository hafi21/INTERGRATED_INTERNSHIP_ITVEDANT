import { z } from "zod";

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().min(1).max(20),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const cartItemIdSchema = z.object({
  body: z.object({
    quantity: z.coerce.number().int().min(1).max(20).optional(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

