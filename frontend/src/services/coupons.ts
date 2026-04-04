import { api } from "./api";
import type { Coupon, CouponApplySummary } from "../types";

export type CouponPayload = {
  couponCode: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  minimumOrderAmount?: number | null;
  applicableProductIds?: number[];
  applicableCategoryIds?: number[];
  status?: boolean;
};

export const couponService = {
  async list(params?: { includeInactive?: boolean }) {
    const { data } = await api.get<{ coupons: Coupon[] }>("/coupons", { params });
    return data.coupons;
  },
  async listAvailable() {
    const { data } = await api.get<{ coupons: Coupon[] }>("/coupons/available");
    return data.coupons;
  },
  async create(payload: CouponPayload) {
    const { data } = await api.post<{ coupon: Coupon }>("/coupons", payload);
    return data.coupon;
  },
  async update(couponId: number, payload: Partial<CouponPayload>) {
    const { data } = await api.put<{ coupon: Coupon }>(`/coupons/${couponId}`, payload);
    return data.coupon;
  },
  async deactivate(couponId: number) {
    const { data } = await api.delete<{ coupon: Coupon }>(`/coupons/${couponId}`);
    return data.coupon;
  },
  async apply(couponCode: string) {
    const { data } = await api.post<{
      coupon: Coupon;
      summary: CouponApplySummary;
    }>("/coupons/apply", { couponCode });
    return data;
  },
};
