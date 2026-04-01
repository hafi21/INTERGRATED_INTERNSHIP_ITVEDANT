import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { serializeOrder } from "../models/order.model.js";
import { ApiError } from "../utils/api-error.js";
import { createOrderNumber, decimalToNumber, roundCurrency } from "../utils/serializers.js";

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

export const getOrders = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: req.user?.role === "ADMIN" ? {} : { userId: req.user!.id },
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

  const order = await prisma.$transaction(
    async (tx) => {
      const createdOrder = await tx.order.create({
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

      await Promise.all(
        cartItems.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              inventory: {
                decrement: item.quantity,
              },
            },
          }),
        ),
      );

      await tx.cartItem.deleteMany({
        where: { userId: req.user!.id },
      });

      return createdOrder;
    },
    {
      maxWait: 20_000,
      timeout: 20_000,
    },
  );

  res.status(StatusCodes.CREATED).json({
    message: "Order placed successfully",
    paymentProvider: req.body.paymentProvider,
    order: serializeOrder(order),
  });
};
