import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10,15}$/, "Phone number must be 10 to 15 digits");

const customerBody = z.object({
  fullName: z.string().min(3).max(80),
  email: z.string().email(),
  phone: phoneSchema,
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number"),
});

export const customerListSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const customerCreateSchema = z.object({
  body: customerBody,
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const customerUpdateSchema = z.object({
  body: customerBody
    .omit({ password: true })
    .extend({
      password: customerBody.shape.password.optional(),
      status: z.coerce.boolean().optional(),
    })
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field must be provided",
    }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const customerIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});
