import { decimalToNumber } from "../utils/serializers.js";

type CouponEntity = {
  couponId: number;
  couponCode: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: unknown;
  validFrom: Date;
  validTo: Date;
  usageLimit: number;
  minimumOrderAmount: unknown | null;
  applicableProductIds: unknown;
  applicableCategoryIds: unknown;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    orders: number;
  };
};

const parseNumberArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => Number(entry))
    .filter((entry) => Number.isInteger(entry) && entry > 0);
};

export const serializeCoupon = (coupon: CouponEntity) => {
  const usedCount = coupon._count?.orders ?? 0;
  const minimumOrderAmount =
    coupon.minimumOrderAmount === null
      ? null
      : decimalToNumber(coupon.minimumOrderAmount as number);

  return {
    couponId: coupon.couponId,
    couponCode: coupon.couponCode,
    discountType: coupon.discountType,
    discountValue: decimalToNumber(coupon.discountValue as number),
    validFrom: coupon.validFrom,
    validTo: coupon.validTo,
    usageLimit: coupon.usageLimit,
    usedCount,
    remainingUsage: Math.max(coupon.usageLimit - usedCount, 0),
    minimumOrderAmount,
    applicableProductIds: parseNumberArray(coupon.applicableProductIds),
    applicableCategoryIds: parseNumberArray(coupon.applicableCategoryIds),
    status: coupon.status,
    isExpired: coupon.validTo.getTime() < Date.now(),
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  };
};
