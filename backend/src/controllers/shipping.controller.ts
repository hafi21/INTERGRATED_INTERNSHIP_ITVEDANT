import { ShippingStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { serializeShipping } from "../models/shipping.model.js";
import { ApiError } from "../utils/api-error.js";

const shippingInclude = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  },
} as const;

export const getShipping = async (req: Request, res: Response) => {
  const shipping = await prisma.shipping.findUnique({
    where: { orderId: Number(req.params.orderId) },
    include: shippingInclude,
  });

  if (!shipping) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping record not found");
  }

  res.status(StatusCodes.OK).json(serializeShipping(shipping));
};

export const createShipping = async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.orderId) },
  });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  const existingShipping = await prisma.shipping.findUnique({
    where: { orderId: order.id },
  });

  if (existingShipping) {
    throw new ApiError(StatusCodes.CONFLICT, "Shipping record already exists for this order");
  }

  const shipping = await prisma.shipping.create({
    data: {
      orderId: order.id,
      shippingCost: order.shippingFee,
      shippingStatus: ShippingStatus.PENDING,
    },
    include: shippingInclude,
  });

  res.status(StatusCodes.CREATED).json({
    message: "Shipping record created",
    ...serializeShipping(shipping),
  });
};

export const updateShipping = async (req: Request, res: Response) => {
  const { courierService, trackingNumber, shippingStatus } = req.body;

  const shipping = await prisma.shipping.findUnique({
    where: { id: Number(req.params.id) },
    include: shippingInclude,
  });

  if (!shipping) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping record not found");
  }

  const updateData: {
    courierService?: string;
    trackingNumber?: string;
    shippingStatus?: ShippingStatus;
    shippedAt?: Date;
    deliveredAt?: Date;
  } = {};

  if (courierService) updateData.courierService = courierService;
  if (trackingNumber) updateData.trackingNumber = trackingNumber;

  if (shippingStatus) {
    if (!Object.values(ShippingStatus).includes(shippingStatus)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid shipping status");
    }
    updateData.shippingStatus = shippingStatus;

    if (shippingStatus === ShippingStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    }
    if (shippingStatus === ShippingStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }
  }

  const updatedShipping = await prisma.shipping.update({
    where: { id: shipping.id },
    data: updateData,
    include: shippingInclude,
  });

  res.status(StatusCodes.OK).json({
    message: "Shipping record updated",
    ...serializeShipping(updatedShipping),
  });
};

export const trackShipment = async (req: Request, res: Response) => {
  const shipping = await prisma.shipping.findUnique({
    where: { orderId: Number(req.params.orderId) },
    include: shippingInclude,
  });

  if (!shipping) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipment tracking information not found");
  }

  // Verify order belongs to user
  if (shipping.order.user.id !== req.user!.id && req.user!.role !== "ADMIN") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Unauthorized to view this shipment");
  }

  res.status(StatusCodes.OK).json({
    tracking: serializeShipping(shipping),
  });
};

export const trackByTrackingNumber = async (req: Request, res: Response) => {
  const { trackingNumber } = req.body;

  if (!trackingNumber || typeof trackingNumber !== "string") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Tracking number is required");
  }

  const shipping = await prisma.shipping.findFirst({
    where: { trackingNumber },
    include: shippingInclude,
  });

  if (!shipping) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipment with this tracking number not found");
  }

  res.status(StatusCodes.OK).json({
    tracking: serializeShipping(shipping),
  });
};

export const getAllShipping = async (req: Request, res: Response) => {
  const statusFilter = req.query.status ? (req.query.status as ShippingStatus) : undefined;

  const shipping = await prisma.shipping.findMany({
    where: {
      shippingStatus: statusFilter,
    },
    include: shippingInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json({
    shipping: shipping.map(serializeShipping),
  });
};
