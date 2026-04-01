import { z } from "zod";

export const createRazorpayOrderSchema = z.object({
  body: z.object({
    orderId: z.coerce.number().int().positive(),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const verifyRazorpayPaymentSchema = z.object({
  body: z.object({
    orderId: z.coerce.number().int().positive(),
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});
