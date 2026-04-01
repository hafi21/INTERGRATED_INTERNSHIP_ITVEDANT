import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.string().min(12).max(255),
    paymentProvider: z.enum(["RAZORPAY", "COD"]).default("RAZORPAY"),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});
