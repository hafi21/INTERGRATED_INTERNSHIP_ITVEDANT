import { DiscountType, OrderStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { serializeCoupon } from "../models/coupon.model.js";
import { ApiError } from "../utils/api-error.js";
import { computeCouponDiscount, computeCartSubtotal } from "../utils/coupon.js";
import { roundCurrency } from "../utils/serializers.js";

const couponInclude = {
  _count: {
    select: {
      orders: {
        where: {
          status: {
            not: OrderStatus.CANCELLED,
          },
        },
      },
    },
  },
} as const;

const getCartItems = async (userId: number) =>
  prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          categoryId: true,
          price: true,
        },
      },
    },
  });

const normalizeCouponCode = (value: string) => value.trim().toUpperCase();

const getValidCoupon = async (couponCode: string) => {
  const normalizedCode = normalizeCouponCode(couponCode);
  const now = new Date();
  const coupon = await prisma.coupon.findFirst({
    where: {
      couponCode: normalizedCode,
    },
    include: couponInclude,
  });

  if (!coupon) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon code is invalid");
  }

  if (!coupon.status) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon is inactive");
  }

  if (coupon.validFrom > now) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Coupon will be active from ${coupon.validFrom.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    );
  }

  if (coupon.validTo < now) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon has expired");
  }

  const usedCount = coupon._count.orders;

  if (usedCount >= coupon.usageLimit) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon usage limit reached");
  }

  return coupon;
};

export const getCoupons = async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === "true";

  const coupons = await prisma.coupon.findMany({
    where: {
      status: includeInactive ? undefined : true,
    },
    include: couponInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json({
    coupons: coupons.map(serializeCoupon),
  });
};

export const getAvailableCoupons = async (_req: Request, res: Response) => {
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      status: true,
      validTo: {
        gte: now,
      },
    },
    include: couponInclude,
    orderBy: [
      {
        validTo: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  const availableCoupons = coupons
    .map(serializeCoupon)
    .filter((coupon) => coupon.remainingUsage > 0);

  res.status(StatusCodes.OK).json({
    coupons: availableCoupons,
  });
};

export const createCoupon = async (req: Request, res: Response) => {
  const couponCode = normalizeCouponCode(req.body.couponCode);

  const existingCoupon = await prisma.coupon.findUnique({
    where: {
      couponCode,
    },
  });

  if (existingCoupon) {
    throw new ApiError(StatusCodes.CONFLICT, "Coupon code already exists");
  }

  const coupon = await prisma.coupon.create({
    data: {
      couponCode,
      discountType: req.body.discountType as DiscountType,
      discountValue: req.body.discountValue,
      validFrom: req.body.validFrom,
      validTo: req.body.validTo,
      usageLimit: req.body.usageLimit,
      minimumOrderAmount: req.body.minimumOrderAmount ?? null,
      applicableProductIds: req.body.applicableProductIds?.length
        ? req.body.applicableProductIds
        : null,
      applicableCategoryIds: req.body.applicableCategoryIds?.length
        ? req.body.applicableCategoryIds
        : null,
      status: req.body.status ?? true,
    },
    include: couponInclude,
  });

  res.status(StatusCodes.CREATED).json({
    message: "Coupon created successfully",
    coupon: serializeCoupon(coupon),
  });
};

export const updateCoupon = async (req: Request, res: Response) => {
  const couponId = Number(req.params.id);

  const existingCoupon = await prisma.coupon.findUnique({
    where: {
      couponId,
    },
    include: couponInclude,
  });

  if (!existingCoupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found");
  }

  if (req.body.couponCode) {
    const couponCode = normalizeCouponCode(req.body.couponCode);
    const duplicateCoupon = await prisma.coupon.findUnique({
      where: {
        couponCode,
      },
    });

    if (duplicateCoupon && duplicateCoupon.couponId !== couponId) {
      throw new ApiError(StatusCodes.CONFLICT, "Coupon code already exists");
    }
  }

  const updatedCoupon = await prisma.coupon.update({
    where: {
      couponId,
    },
    data: {
      couponCode: req.body.couponCode
        ? normalizeCouponCode(req.body.couponCode)
        : undefined,
      discountType: req.body.discountType,
      discountValue: req.body.discountValue,
      validFrom: req.body.validFrom,
      validTo: req.body.validTo,
      usageLimit: req.body.usageLimit,
      minimumOrderAmount:
        req.body.minimumOrderAmount !== undefined
          ? req.body.minimumOrderAmount
          : undefined,
      applicableProductIds:
        req.body.applicableProductIds !== undefined
          ? req.body.applicableProductIds.length
            ? req.body.applicableProductIds
            : null
          : undefined,
      applicableCategoryIds:
        req.body.applicableCategoryIds !== undefined
          ? req.body.applicableCategoryIds.length
            ? req.body.applicableCategoryIds
            : null
          : undefined,
      status: req.body.status,
    },
    include: couponInclude,
  });

  res.status(StatusCodes.OK).json({
    message: "Coupon updated successfully",
    coupon: serializeCoupon(updatedCoupon),
  });
};

export const deactivateCoupon = async (req: Request, res: Response) => {
  const couponId = Number(req.params.id);

  const existingCoupon = await prisma.coupon.findUnique({
    where: {
      couponId,
    },
  });

  if (!existingCoupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found");
  }

  const coupon = await prisma.coupon.update({
    where: {
      couponId,
    },
    data: {
      status: false,
    },
    include: couponInclude,
  });

  res.status(StatusCodes.OK).json({
    message: "Coupon deactivated successfully",
    coupon: serializeCoupon(coupon),
  });
};

export const applyCoupon = async (req: Request, res: Response) => {
  const cartItems = await getCartItems(req.user!.id);

  if (!cartItems.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Your cart is empty");
  }

  const coupon = await getValidCoupon(req.body.couponCode);
  const calculation = computeCouponDiscount(coupon, cartItems);

  if (!calculation.applicable) {
    throw new ApiError(StatusCodes.BAD_REQUEST, calculation.reason ?? "Coupon is not applicable");
  }

  const shippingFee = calculation.subtotal >= 500 ? 0 : 25;
  const totalAmount = roundCurrency(calculation.subtotal + shippingFee - calculation.discountAmount);

  res.status(StatusCodes.OK).json({
    message: "Coupon applied successfully",
    coupon: serializeCoupon(coupon),
    summary: {
      subtotal: computeCartSubtotal(cartItems),
      shippingFee,
      discountAmount: calculation.discountAmount,
      totalAmount,
      eligibleSubtotal: calculation.eligibleSubtotal,
    },
  });
};
