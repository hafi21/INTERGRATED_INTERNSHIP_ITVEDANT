import { z } from "zod";

export const createShippingSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    orderId: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const updateShippingSchema = z.object({
  body: z.object({
    courierService: z.string().optional(),
    trackingNumber: z.string().optional(),
    shippingStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const trackShipmentSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    orderId: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const getShippingSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    orderId: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const trackByTrackingNumberSchema = z.object({
  body: z.object({
    trackingNumber: z.string().trim().min(1, "Tracking number is required"),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});
