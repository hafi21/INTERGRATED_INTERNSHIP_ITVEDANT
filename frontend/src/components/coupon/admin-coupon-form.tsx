import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import type { Coupon } from "../../types";

const couponSchema = z
  .object({
    couponCode: z.string().trim().min(3).max(50),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discountValue: z.coerce.number().positive(),
    validFrom: z.string().min(1),
    validTo: z.string().min(1),
    usageLimit: z.coerce.number().int().positive(),
    minimumOrderAmount: z.string().optional(),
    applicableProductIds: z.array(z.coerce.number().int().positive()).optional(),
    applicableCategoryIds: z.array(z.coerce.number().int().positive()).optional(),
  })
  .superRefine((value, ctx) => {
    const from = new Date(value.validFrom);
    const to = new Date(value.validTo);

    if (to <= from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validTo"],
        message: "Valid to must be after valid from",
      });
    }

    if (value.discountType === "PERCENTAGE" && value.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountValue"],
        message: "Percentage discount cannot exceed 100",
      });
    }
  });

export type CouponFormValues = z.infer<typeof couponSchema>;

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const localTime = new Date(date.getTime() - timezoneOffset);
  return localTime.toISOString().slice(0, 16);
};

const getDefaultDateRange = () => {
  const now = new Date();
  const validTo = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    validFrom: toDateTimeLocal(now.toISOString()),
    validTo: toDateTimeLocal(validTo.toISOString()),
  };
};

type AdminCouponFormProps = {
  selectedCoupon: Coupon | null;
  products: Array<{ id: number; name: string }>;
  categories: Array<{ categoryId: number; categoryName: string }>;
  onSubmit: (values: CouponFormValues) => void;
  loading?: boolean;
  onReset: () => void;
};

export const AdminCouponForm = ({
  selectedCoupon,
  products,
  categories,
  onSubmit,
  loading,
  onReset,
}: AdminCouponFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      couponCode: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      ...getDefaultDateRange(),
      usageLimit: 50,
      minimumOrderAmount: "",
      applicableProductIds: [],
      applicableCategoryIds: [],
    },
  });

  const discountType = watch("discountType");

  useEffect(() => {
    if (!selectedCoupon) {
      reset({
        couponCode: "",
        discountType: "PERCENTAGE",
        discountValue: 10,
        ...getDefaultDateRange(),
        usageLimit: 50,
        minimumOrderAmount: "",
        applicableProductIds: [],
        applicableCategoryIds: [],
      });
      return;
    }

    reset({
      couponCode: selectedCoupon.couponCode,
      discountType: selectedCoupon.discountType,
      discountValue: selectedCoupon.discountValue,
      validFrom: toDateTimeLocal(selectedCoupon.validFrom),
      validTo: toDateTimeLocal(selectedCoupon.validTo),
      usageLimit: selectedCoupon.usageLimit,
      minimumOrderAmount:
        selectedCoupon.minimumOrderAmount !== null
          ? String(selectedCoupon.minimumOrderAmount)
          : "",
      applicableProductIds: selectedCoupon.applicableProductIds,
      applicableCategoryIds: selectedCoupon.applicableCategoryIds,
    });
  }, [reset, selectedCoupon]);

  return (
    <Card className="rounded-[28px]">
      <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Coupon Form</p>
      <h3 className="mt-2 text-2xl font-semibold text-ink">
        {selectedCoupon ? "Edit coupon" : "Create coupon"}
      </h3>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Coupon code</label>
            <input
              {...register("couponCode")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              placeholder="SAVE20"
            />
            {errors.couponCode ? <p className="mt-1 text-xs text-red-500">{errors.couponCode.message}</p> : null}
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Discount type</label>
            <select
              {...register("discountType")}
              className="form-select mt-2"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed amount</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Discount value {discountType === "PERCENTAGE" ? "(%)" : "(INR)"}
            </label>
            <input
              {...register("discountValue")}
              type="number"
              min="0"
              step="0.01"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
            {errors.discountValue ? <p className="mt-1 text-xs text-red-500">{errors.discountValue.message}</p> : null}
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Usage limit</label>
            <input
              {...register("usageLimit")}
              type="number"
              min="1"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Minimum order (optional)</label>
            <input
              {...register("minimumOrderAmount")}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Valid from</label>
            <input
              {...register("validFrom")}
              type="datetime-local"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Valid to</label>
            <input
              {...register("validTo")}
              type="datetime-local"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
            {errors.validTo ? <p className="mt-1 text-xs text-red-500">{errors.validTo.message}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Applicable products (optional)</label>
            <select
              multiple
              size={5}
              {...register("applicableProductIds")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Applicable categories (optional)</label>
            <select
              multiple
              size={5}
              {...register("applicableCategoryIds")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            >
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : selectedCoupon ? "Update Coupon" : "Create Coupon"}
          </Button>
          {selectedCoupon ? (
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              onClick={() => {
                onReset();
                reset({
                  couponCode: "",
                  discountType: "PERCENTAGE",
                  discountValue: 10,
                  ...getDefaultDateRange(),
                  usageLimit: 50,
                  minimumOrderAmount: "",
                  applicableProductIds: [],
                  applicableCategoryIds: [],
                });
              }}
            >
              Cancel Edit
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
};
