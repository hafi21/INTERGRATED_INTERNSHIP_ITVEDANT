import { z } from "zod";

const adminOrderStatusFilterSchema = z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]);

export const orderListSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    scope: z.enum(["all"]).optional(),
    status: adminOrderStatusFilterSchema.optional(),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.string().min(12).max(255),
    paymentProvider: z.enum(["RAZORPAY", "COD"]).default("RAZORPAY"),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const cancelOrderSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "SHIPPED", "DELIVERED"]),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});
