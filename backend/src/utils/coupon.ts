import type { DiscountType } from "@prisma/client";
import { decimalToNumber, roundCurrency } from "./serializers.js";

type CouponLike = {
  discountType: DiscountType;
  discountValue: unknown;
  minimumOrderAmount: unknown | null;
  applicableProductIds: unknown;
  applicableCategoryIds: unknown;
};

type CartLine = {
  quantity: number;
  product: {
    id: number;
    categoryId: number;
    price: unknown;
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

export const computeCartSubtotal = (cartItems: CartLine[]) =>
  roundCurrency(
    cartItems.reduce(
      (sum, item) => sum + decimalToNumber(item.product.price as number) * item.quantity,
      0,
    ),
  );

export const computeCouponDiscount = (coupon: CouponLike, cartItems: CartLine[]) => {
  const minimumOrderAmount =
    coupon.minimumOrderAmount === null
      ? null
      : decimalToNumber(coupon.minimumOrderAmount as number);
  const subtotal = computeCartSubtotal(cartItems);

  if (minimumOrderAmount !== null && subtotal < minimumOrderAmount) {
    return {
      applicable: false,
      reason: `Coupon requires a minimum order of ${minimumOrderAmount}`,
      discountAmount: 0,
      eligibleSubtotal: 0,
      subtotal,
    };
  }

  const applicableProductIds = parseNumberArray(coupon.applicableProductIds);
  const applicableCategoryIds = parseNumberArray(coupon.applicableCategoryIds);
  const hasScopeFilters = applicableProductIds.length > 0 || applicableCategoryIds.length > 0;

  const eligibleSubtotal = roundCurrency(
    cartItems.reduce((sum, item) => {
      const unitPrice = decimalToNumber(item.product.price as number);
      const lineTotal = unitPrice * item.quantity;

      if (!hasScopeFilters) {
        return sum + lineTotal;
      }

      const productMatch = applicableProductIds.includes(item.product.id);
      const categoryMatch = applicableCategoryIds.includes(item.product.categoryId);

      if (productMatch || categoryMatch) {
        return sum + lineTotal;
      }

      return sum;
    }, 0),
  );

  if (eligibleSubtotal <= 0) {
    return {
      applicable: false,
      reason: "Coupon is not applicable to products currently in your cart",
      discountAmount: 0,
      eligibleSubtotal: 0,
      subtotal,
    };
  }

  const discountValue = decimalToNumber(coupon.discountValue as number);
  const rawDiscount =
    coupon.discountType === "PERCENTAGE"
      ? eligibleSubtotal * (discountValue / 100)
      : discountValue;
  const discountAmount = roundCurrency(Math.min(rawDiscount, eligibleSubtotal));

  return {
    applicable: true,
    reason: null,
    discountAmount,
    eligibleSubtotal,
    subtotal,
  };
};
