import { z } from "zod";

export const paymentListSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  }).default({}),
});

export const createRazorpayOrderSchema = z.object({
  body: z.object({
    orderId: z.coerce.number().int().positive(),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const refundPaymentSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
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
