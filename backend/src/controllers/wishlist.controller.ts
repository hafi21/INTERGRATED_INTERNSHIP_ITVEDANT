import { ProductStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { serializeWishlist } from "../models/wishlist.model.js";
import { ApiError } from "../utils/api-error.js";

const wishlistItemInclude = {
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

export const getWishlist = async (req: Request, res: Response) => {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.user!.id },
    include: wishlistItemInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json(serializeWishlist(items));
};

export const addToWishlist = async (req: Request, res: Response) => {
  const { productId } = req.body;

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

  const existingItem = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId: req.user!.id,
        productId,
      },
    },
  });

  if (existingItem) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Product already in wishlist");
  }

  await prisma.wishlist.create({
    data: {
      userId: req.user!.id,
      productId,
    },
  });

  const items = await prisma.wishlist.findMany({
    where: { userId: req.user!.id },
    include: wishlistItemInclude,
  });

  res.status(StatusCodes.CREATED).json({
    message: "Product added to wishlist",
    ...serializeWishlist(items),
  });
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  const wishlistItem = await prisma.wishlist.findFirst({
    where: {
      id: Number(req.params.id),
      userId: req.user!.id,
    },
  });

  if (!wishlistItem) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Wishlist item not found");
  }

  await prisma.wishlist.delete({
    where: { id: wishlistItem.id },
  });

  const items = await prisma.wishlist.findMany({
    where: { userId: req.user!.id },
    include: wishlistItemInclude,
  });

  res.status(StatusCodes.OK).json({
    message: "Item removed from wishlist",
    ...serializeWishlist(items),
  });
};

export const moveToCart = async (req: Request, res: Response) => {
  const wishlistItem = await prisma.wishlist.findFirst({
    where: {
      id: Number(req.params.id),
      userId: req.user!.id,
    },
    include: {
      product: true,
    },
  });

  if (!wishlistItem) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Wishlist item not found");
  }

  // Check product availability
  if (wishlistItem.product.status !== ProductStatus.ACTIVE) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Product is no longer available");
  }

  // Add to cart
  const cartItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId: req.user!.id,
        productId: wishlistItem.productId,
      },
    },
  });

  const nextQuantity = (cartItem?.quantity ?? 0) + 1;

  if (nextQuantity > wishlistItem.product.inventory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Product out of stock");
  }

  await prisma.cartItem.upsert({
    where: {
      userId_productId: {
        userId: req.user!.id,
        productId: wishlistItem.productId,
      },
    },
    create: {
      userId: req.user!.id,
      productId: wishlistItem.productId,
      quantity: 1,
    },
    update: {
      quantity: nextQuantity,
    },
  });

  // Remove from wishlist
  await prisma.wishlist.delete({
    where: { id: wishlistItem.id },
  });

  const items = await prisma.wishlist.findMany({
    where: { userId: req.user!.id },
    include: wishlistItemInclude,
  });

  res.status(StatusCodes.OK).json({
    message: "Product moved to cart successfully",
    ...serializeWishlist(items),
  });
};
