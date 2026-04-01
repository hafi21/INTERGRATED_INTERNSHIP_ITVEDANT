import { ProductStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { serializeCart } from "../models/cart.model.js";
import { ApiError } from "../utils/api-error.js";

const cartItemInclude = {
  product: {
    include: {
      category: {
        select: {
          categoryId: true,
          categoryName: true,
        },
      },
    },
  },
} as const;

export const getCart = async (req: Request, res: Response) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: cartItemInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json(serializeCart(items));
};

export const addToCart = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      status: ProductStatus.ACTIVE,
      category: {
        status: true,
      },
    },
  });

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product is not available");
  }

  const currentItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId: req.user!.id,
        productId,
      },
    },
  });

  const nextQuantity = (currentItem?.quantity ?? 0) + quantity;

  if (nextQuantity > product.inventory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Requested quantity exceeds inventory");
  }

  await prisma.cartItem.upsert({
    where: {
      userId_productId: {
        userId: req.user!.id,
        productId,
      },
    },
    create: {
      userId: req.user!.id,
      productId,
      quantity,
    },
    update: {
      quantity: nextQuantity,
    },
  });

  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: cartItemInclude,
  });

  res.status(StatusCodes.OK).json({
    message: "Item added to cart",
    ...serializeCart(items),
  });
};

export const updateCartItem = async (req: Request, res: Response) => {
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: Number(req.params.id),
      userId: req.user!.id,
    },
    include: {
      product: true,
    },
  });

  if (!cartItem) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Cart item not found");
  }

  const quantity = req.body.quantity;

  if (quantity > cartItem.product.inventory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Requested quantity exceeds inventory");
  }

  await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity },
  });

  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: cartItemInclude,
  });

  res.status(StatusCodes.OK).json({
    message: "Cart updated successfully",
    ...serializeCart(items),
  });
};

export const removeCartItem = async (req: Request, res: Response) => {
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: Number(req.params.id),
      userId: req.user!.id,
    },
  });

  if (!cartItem) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Cart item not found");
  }

  await prisma.cartItem.delete({
    where: { id: cartItem.id },
  });

  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: cartItemInclude,
  });

  res.status(StatusCodes.OK).json({
    message: "Item removed from cart",
    ...serializeCart(items),
  });
};

export const clearCart = async (req: Request, res: Response) => {
  await prisma.cartItem.deleteMany({
    where: { userId: req.user!.id },
  });

  res.status(StatusCodes.OK).json({
    message: "Cart cleared successfully",
    items: [],
    summary: {
      itemCount: 0,
      subtotal: 0,
    },
  });
};

