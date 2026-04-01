import { OrderStatus, PaymentStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { serializeOrder } from "../models/order.model.js";
import { getRazorpayInstance, getRazorpayKeyId, verifyRazorpaySignature } from "../services/razorpay.service.js";
import { ApiError } from "../utils/api-error.js";
import { decimalToNumber } from "../utils/serializers.js";

const orderInclude = {
  orderItems: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  },
  payment: true,
} as const;

const getAccessibleOrder = async (orderId: number, userId: number) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: orderInclude,
  });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  return order;
};

export const createRazorpayOrder = async (req: Request, res: Response) => {
  const order = await getAccessibleOrder(
    req.body.orderId,
    req.user!.id,
  );

  if (order.payment?.status === PaymentStatus.SUCCESS || order.status === OrderStatus.PAID) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "This order is already paid");
  }

  const razorpay = getRazorpayInstance();
  const amountInSubunits = Math.round(decimalToNumber(order.totalAmount) * 100);
  const razorpayOrder = await razorpay.orders.create({
    amount: amountInSubunits,
    currency: "INR",
    receipt: order.orderNumber,
    notes: {
      internalOrderId: String(order.id),
      orderNumber: order.orderNumber,
    },
  });

  res.status(StatusCodes.CREATED).json({
    keyId: getRazorpayKeyId(),
    order: serializeOrder(order),
    checkout: {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  });
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  const order = await getAccessibleOrder(
    req.body.orderId,
    req.user!.id,
  );

  if (order.payment?.status === PaymentStatus.SUCCESS || order.status === OrderStatus.PAID) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "This order is already paid");
  }

  const isValidSignature = verifyRazorpaySignature({
    razorpayOrderId: req.body.razorpayOrderId,
    razorpayPaymentId: req.body.razorpayPaymentId,
    razorpaySignature: req.body.razorpaySignature,
  });

  if (!isValidSignature) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Payment signature verification failed");
  }

  const updateOrderOperation = prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.PAID,
    },
    include: orderInclude,
  });

  const transactionResults = await prisma.$transaction([
    prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        provider: "RAZORPAY",
        transactionRef: req.body.razorpayPaymentId,
        amount: decimalToNumber(order.totalAmount),
        status: PaymentStatus.SUCCESS,
      },
      create: {
        orderId: order.id,
        provider: "RAZORPAY",
        transactionRef: req.body.razorpayPaymentId,
        amount: decimalToNumber(order.totalAmount),
        status: PaymentStatus.SUCCESS,
      },
    }),
    updateOrderOperation,
  ]);

  const updatedOrder = transactionResults[1] as Awaited<typeof updateOrderOperation>;

  res.status(StatusCodes.OK).json({
    message: "Payment verified successfully",
    order: serializeOrder(updatedOrder),
  });
};
