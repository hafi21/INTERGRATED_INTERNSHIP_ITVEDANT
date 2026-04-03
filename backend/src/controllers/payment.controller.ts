import { OrderStatus, PaymentStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { serializePayment } from "../models/payment.model.js";
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

const paymentInclude = {
  order: {
    include: {
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

const paymentStatusFilterMap: Record<"PENDING" | "PAID" | "FAILED" | "REFUNDED", PaymentStatus> = {
  PENDING: PaymentStatus.PENDING,
  PAID: PaymentStatus.SUCCESS,
  FAILED: PaymentStatus.FAILED,
  REFUNDED: PaymentStatus.REFUNDED,
};

const formatPaymentMethod = (method?: string | null) => {
  if (!method) {
    return null;
  }

  const normalized = method.trim().toLowerCase();

  if (normalized === "upi") {
    return "UPI";
  }

  if (normalized === "emi") {
    return "EMI";
  }

  return normalized
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

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

export const getPayments = async (req: Request, res: Response) => {
  const statusFilter = req.query.status
    ? paymentStatusFilterMap[req.query.status as keyof typeof paymentStatusFilterMap]
    : undefined;

  const payments = await prisma.payment.findMany({
    where: {
      status: statusFilter,
    },
    include: paymentInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json({
    payments: payments.map(serializePayment),
  });
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

  const razorpay = getRazorpayInstance();
  const razorpayPayment = await razorpay.payments.fetch(req.body.razorpayPaymentId);
  const paymentMethod = formatPaymentMethod(razorpayPayment.method);

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
        paymentMethod,
        transactionRef: req.body.razorpayPaymentId,
        amount: decimalToNumber(order.totalAmount),
        status: PaymentStatus.SUCCESS,
        refundReference: null,
        refundedAt: null,
      },
      create: {
        orderId: order.id,
        provider: "RAZORPAY",
        paymentMethod,
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

export const refundPayment = async (req: Request, res: Response) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: Number(req.params.id),
    },
    include: {
      order: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          orderItems: true,
        },
      },
    },
  });

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Payment record not found");
  }

  if (payment.provider !== "RAZORPAY") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Only Razorpay payments can be refunded");
  }

  if (payment.status === PaymentStatus.REFUNDED) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "This payment is already refunded");
  }

  if (payment.status !== PaymentStatus.SUCCESS) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Only successful payments can be refunded");
  }

  const razorpay = getRazorpayInstance();
  const refund = await razorpay.payments.refund(payment.transactionRef, {
    amount: Math.round(decimalToNumber(payment.amount) * 100),
    speed: "normal",
    notes: {
      internalPaymentId: String(payment.id),
      orderNumber: payment.order.orderNumber,
    },
  });

  const shouldRestock = payment.order.status === OrderStatus.PAID;

  const updatePaymentOperation = prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.REFUNDED,
      refundReference: refund.id,
      refundedAt: new Date(),
    },
    include: paymentInclude,
  });

  const transactionResults = await prisma.$transaction([
    ...(shouldRestock
      ? payment.order.orderItems.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: {
              inventory: {
                increment: item.quantity,
              },
            },
          }),
        )
      : []),
    ...(shouldRestock
      ? [
          prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: OrderStatus.CANCELLED,
            },
          }),
        ]
      : []),
    updatePaymentOperation,
  ]);

  const updatedPayment = transactionResults[transactionResults.length - 1] as Awaited<
    typeof updatePaymentOperation
  >;

  res.status(StatusCodes.OK).json({
    message: "Payment refunded successfully",
    payment: serializePayment(updatedPayment),
  });
};
