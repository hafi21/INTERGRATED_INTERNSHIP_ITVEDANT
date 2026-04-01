import { z } from "zod";

const categoryBody = z.object({
  categoryName: z.string().min(2).max(100),
  description: z.string().max(300).optional().or(z.literal("")),
});

export const categoryCreateSchema = z.object({
  body: categoryBody,
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const categoryUpdateSchema = z.object({
  body: categoryBody,
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const categoryDeleteSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

