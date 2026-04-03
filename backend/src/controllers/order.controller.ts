import { OrderStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { serializeOrder } from "../models/order.model.js";
import { ApiError } from "../utils/api-error.js";
import { createOrderNumber, decimalToNumber, roundCurrency } from "../utils/serializers.js";

const orderInclude = {
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
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

const statusFilterMap: Record<string, OrderStatus> = {
  PENDING: OrderStatus.PENDING,
  PAID: OrderStatus.PAID,
  SHIPPED: OrderStatus.PROCESSING,
  DELIVERED: OrderStatus.FULFILLED,
  CANCELLED: OrderStatus.CANCELLED,
};

const incomingStatusMap: Record<"PENDING" | "SHIPPED" | "DELIVERED", OrderStatus> = {
  PENDING: OrderStatus.PENDING,
  SHIPPED: OrderStatus.PROCESSING,
  DELIVERED: OrderStatus.FULFILLED,
};

export const getOrders = async (req: Request, res: Response) => {
  const isAdminScope = req.user!.role === "ADMIN" && req.query.scope === "all";
  const statusFilter = req.query.status
    ? statusFilterMap[String(req.query.status)]
    : undefined;

  const orders = await prisma.order.findMany({
    where: {
      userId: isAdminScope ? undefined : req.user!.id,
      status: statusFilter,
    },
    include: orderInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json({
    orders: orders.map(serializeOrder),
  });
};

export const createOrder = async (req: Request, res: Response) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!cartItems.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Your cart is empty");
  }

  cartItems.forEach((item) => {
    if (!item.product.category.status || item.product.inventory < item.quantity) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Not enough inventory for ${item.product.name}`,
      );
    }
  });

  const subtotal = roundCurrency(
    cartItems.reduce(
      (sum, item) => sum + decimalToNumber(item.product.price) * item.quantity,
      0,
    ),
  );
  const shippingFee = subtotal >= 500 ? 0 : 25;
  const totalAmount = roundCurrency(subtotal + shippingFee);

  const createOrderOperation = prisma.order.create({
    data: {
      userId: req.user!.id,
      orderNumber: createOrderNumber(),
      shippingAddress: req.body.shippingAddress,
      subtotal,
      shippingFee,
      totalAmount,
      orderItems: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price,
          lineTotal: roundCurrency(decimalToNumber(item.product.price) * item.quantity),
        })),
      },
    },
    include: orderInclude,
  });

  const transactionSteps = [
    createOrderOperation,
    ...cartItems.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: {
          inventory: {
            decrement: item.quantity,
          },
        },
      }),
    ),
    prisma.cartItem.deleteMany({
      where: { userId: req.user!.id },
    }),
  ];

  const transactionResults = await prisma.$transaction(transactionSteps);
  const order = transactionResults[0] as Awaited<typeof createOrderOperation>;

  res.status(StatusCodes.CREATED).json({
    message: "Order placed successfully",
    paymentProvider: req.body.paymentProvider,
    order: serializeOrder(order),
  });
};

export const cancelOrder = async (req: Request, res: Response) => {
  const order = await prisma.order.findFirst({
    where: {
      id: Number(req.params.id),
      userId: req.user!.role === "ADMIN" ? undefined : req.user!.id,
    },
    include: orderInclude,
  });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  if (order.status === "CANCELLED") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order is already cancelled");
  }

  if (
    order.status === OrderStatus.PAID ||
    order.status === OrderStatus.PROCESSING ||
    order.status === OrderStatus.FULFILLED
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Paid, shipped, or delivered orders cannot be cancelled",
    );
  }

  if (order.payment?.status === "SUCCESS") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Paid orders cannot be cancelled");
  }

  const updateOrderOperation = prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.CANCELLED,
    },
    include: orderInclude,
  });

  const transactionResults = await prisma.$transaction([
    ...order.orderItems.map((item) =>
      prisma.product.update({
        where: { id: item.product.id },
        data: {
          inventory: {
            increment: item.quantity,
          },
        },
      }),
    ),
    updateOrderOperation,
  ]);

  const updatedOrder = transactionResults[transactionResults.length - 1] as Awaited<
    typeof updateOrderOperation
  >;

  res.status(StatusCodes.OK).json({
    message: "Order cancelled successfully",
    order: serializeOrder(updatedOrder),
  });
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
    include: orderInclude,
  });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Cancelled orders cannot be updated");
  }

  const nextStatus = incomingStatusMap[req.body.status as keyof typeof incomingStatusMap];

  if (!nextStatus) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Unsupported order status");
  }

  if (nextStatus === OrderStatus.PENDING && order.payment?.status === "SUCCESS") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Paid orders cannot be moved back to pending");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: nextStatus,
    },
    include: orderInclude,
  });

  res.status(StatusCodes.OK).json({
    message: "Order status updated successfully",
    order: serializeOrder(updatedOrder),
  });
};
