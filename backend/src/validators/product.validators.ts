import { z } from "zod";

const productBody = z.object({
  name: z.string().min(3).max(140),
  description: z.string().min(10).max(500),
  price: z.coerce.number().positive(),
  inventory: z.coerce.number().int().min(0),
  imageUrl: z.string().url(),
  featured: z.coerce.boolean().optional().default(false),
  categoryId: z.coerce.number().int().positive(),
  status: z.enum(["ACTIVE", "DRAFT", "INACTIVE"]).optional().default("ACTIVE"),
});

export const productCreateSchema = z.object({
  body: productBody,
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const productUpdateSchema = z.object({
  body: productBody.partial(),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const productListSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    categoryId: z.coerce.number().int().positive().optional(),
    featured: z.enum(["true", "false"]).optional(),
    includeInactive: z.enum(["true", "false"]).optional(),
    search: z.string().trim().optional(),
  }),
});

export const productIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

