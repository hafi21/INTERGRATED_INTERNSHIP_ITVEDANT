import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { AdminCouponForm, type CouponFormValues } from "../components/coupon/admin-coupon-form";
import { CouponDashboard } from "../components/coupon/coupon-dashboard";
import { ConfirmModal } from "../components/shared/confirm-modal";
import { SectionHeading } from "../components/shared/section-heading";
import { categoryService } from "../services/categories";
import { couponService } from "../services/coupons";
import { productService } from "../services/products";
import type { Coupon } from "../types";

export const AdminCouponsPage = () => {
  const queryClient = useQueryClient();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Coupon | null>(null);

  const { data: coupons = [] } = useQuery({
    queryKey: ["coupons", "admin"],
    queryFn: () => couponService.list({ includeInactive: true }),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products", "coupon-form"],
    queryFn: () => productService.list({ includeInactive: true }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "coupon-form"],
    queryFn: () => categoryService.list(),
  });

  const getErrorMessage = (error: unknown, fallback: string) =>
    axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

  const saveMutation = useMutation({
    mutationFn: (values: CouponFormValues) =>
      selectedCoupon
        ? couponService.update(selectedCoupon.couponId, {
            ...values,
            couponCode: values.couponCode.toUpperCase(),
            validFrom: new Date(values.validFrom).toISOString(),
            validTo: new Date(values.validTo).toISOString(),
            minimumOrderAmount: values.minimumOrderAmount
              ? Number(values.minimumOrderAmount)
              : null,
          })
        : couponService.create({
            ...values,
            couponCode: values.couponCode.toUpperCase(),
            validFrom: new Date(values.validFrom).toISOString(),
            validTo: new Date(values.validTo).toISOString(),
            minimumOrderAmount: values.minimumOrderAmount
              ? Number(values.minimumOrderAmount)
              : null,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success(selectedCoupon ? "Coupon updated" : "Coupon created");
      setSelectedCoupon(null);
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, "Unable to save coupon")),
  });

  const deactivateMutation = useMutation({
    mutationFn: (couponId: number) => couponService.deactivate(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon deactivated");
      setDeactivateTarget(null);
      setSelectedCoupon((current) =>
        current && current.couponId === deactivateTarget?.couponId ? null : current,
      );
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, "Unable to deactivate coupon")),
  });

  const stats = useMemo(() => {
    const active = coupons.filter((coupon) => coupon.status && !coupon.isExpired).length;
    const expired = coupons.filter((coupon) => coupon.status && coupon.isExpired).length;
    const inactive = coupons.filter((coupon) => !coupon.status).length;

    return { total: coupons.length, active, expired, inactive };
  }, [coupons]);

  return (
    <main className="section-shell py-14">
      <SectionHeading
        eyebrow="Discount Operations"
        title="Coupon management"
        description="Create discount campaigns, control validity windows, and apply coupon governance from one admin dashboard."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Coupons</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{stats.total}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">{stats.active}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Expired</p>
          <p className="mt-3 text-3xl font-semibold text-amber-700">{stats.expired}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Inactive</p>
          <p className="mt-3 text-3xl font-semibold text-slate-500">{stats.inactive}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.95fr,1.05fr]">
        <AdminCouponForm
          selectedCoupon={selectedCoupon}
          products={products.map((product) => ({ id: product.id, name: product.name }))}
          categories={categories}
          onSubmit={(values) => saveMutation.mutate(values)}
          loading={saveMutation.isPending}
          onReset={() => setSelectedCoupon(null)}
        />
        <CouponDashboard
          coupons={coupons}
          onEdit={setSelectedCoupon}
          onDeactivate={setDeactivateTarget}
        />
      </div>

      <ConfirmModal
        open={Boolean(deactivateTarget)}
        title="Deactivate coupon?"
        description="This will disable coupon usage at checkout while keeping historical records intact."
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() =>
          deactivateTarget && deactivateMutation.mutate(deactivateTarget.couponId)
        }
        confirmLabel="Deactivate"
      />
    </main>
  );
};
