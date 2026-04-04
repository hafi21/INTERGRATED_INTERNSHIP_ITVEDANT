import { z } from "zod";

const discountTypeSchema = z.enum(["PERCENTAGE", "FIXED_AMOUNT"]);

const couponBaseSchema = z.object({
  couponCode: z
    .string()
    .trim()
    .min(3, "Coupon code must have at least 3 characters")
    .max(50, "Coupon code cannot exceed 50 characters")
    .regex(/^[A-Z0-9_-]+$/, "Coupon code can contain only uppercase letters, numbers, _ and -"),
  discountType: discountTypeSchema,
  discountValue: z.coerce.number().positive("Discount value must be greater than 0"),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  usageLimit: z.coerce.number().int().positive("Usage limit must be greater than 0"),
  minimumOrderAmount: z.coerce.number().min(0).optional().nullable(),
  applicableProductIds: z.array(z.coerce.number().int().positive()).optional().default([]),
  applicableCategoryIds: z.array(z.coerce.number().int().positive()).optional().default([]),
  status: z.coerce.boolean().optional().default(true),
});

const withCouponRules = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((value: unknown, ctx) => {
    if (!value || typeof value !== "object") {
      return;
    }

    const coupon = value as {
      validFrom?: Date;
      validTo?: Date;
      discountType?: "PERCENTAGE" | "FIXED_AMOUNT";
      discountValue?: number;
    };

    if (coupon.validFrom && coupon.validTo && coupon.validTo <= coupon.validFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid to date must be after valid from date",
        path: ["validTo"],
      });
    }

    if (
      coupon.discountType === "PERCENTAGE" &&
      typeof coupon.discountValue === "number" &&
      coupon.discountValue > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percentage discount cannot exceed 100",
        path: ["discountValue"],
      });
    }
  });

const couponCreateBodySchema = withCouponRules(couponBaseSchema);
const couponUpdateBodySchema = withCouponRules(couponBaseSchema.partial()).refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field must be provided",
  },
);

export const couponListSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    includeInactive: z.enum(["true", "false"]).optional(),
  }),
});

export const availableCouponSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const couponCreateSchema = z.object({
  body: couponCreateBodySchema,
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const couponUpdateSchema = z.object({
  body: couponUpdateBodySchema,
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const couponIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).default({}),
});

export const applyCouponSchema = z.object({
  body: z.object({
    couponCode: z.string().trim().min(3).max(50),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});
