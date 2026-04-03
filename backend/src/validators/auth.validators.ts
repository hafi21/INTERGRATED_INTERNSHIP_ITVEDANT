import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(3).max(80),
    email: z.string().email(),
    phone: z.string().regex(/^[0-9]{10,15}$/, "Phone number must be 10 to 15 digits"),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[0-9]/, "Password must include at least one number"),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});
