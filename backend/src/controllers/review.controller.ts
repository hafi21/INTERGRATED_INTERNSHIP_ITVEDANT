import { OrderStatus, PaymentStatus, ProductStatus, UserRole } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { serializeReview } from "../models/review.model.js";
import { ApiError } from "../utils/api-error.js";

const approvedOrderStatuses: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.FULFILLED,
];

const reviewInclude = {
  customer: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  },
} as const;

const hasPurchasedProduct = async (customerId: number, productId: number) => {
  const purchasedItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId: customerId,
        OR: [
          {
            status: {
              in: approvedOrderStatuses,
            },
          },
          {
            payment: {
              is: {
                status: PaymentStatus.SUCCESS,
              },
            },
          },
        ],
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(purchasedItem);
};

const resolveModerationStatusFilter = (status?: string) => {
  if (status === "pending") {
    return false;
  }

  if (status === "approved") {
    return true;
  }

  return undefined;
};

export const getProductReviews = async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      status: true,
      category: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!product || product.status !== ProductStatus.ACTIVE || !product.category.status) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }

  const approvedReviews = await prisma.review.findMany({
    where: {
      productId,
      status: true,
    },
    include: reviewInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  const reviewAggregate = await prisma.review.aggregate({
    where: {
      productId,
      status: true,
    },
    _avg: {
      rating: true,
    },
    _count: {
      reviewId: true,
    },
  });

  let myReview = null;
  let canReview = false;

  if (req.user?.role === UserRole.CUSTOMER) {
    myReview = await prisma.review.findUnique({
      where: {
        productId_customerId: {
          productId,
          customerId: req.user.id,
        },
      },
      include: reviewInclude,
    });

    canReview = await hasPurchasedProduct(req.user.id, productId);
  }

  res.status(StatusCodes.OK).json({
    reviews: approvedReviews.map(serializeReview),
    summary: {
      averageRating: Number((reviewAggregate._avg.rating ?? 0).toFixed(1)),
      totalReviews: reviewAggregate._count.reviewId,
    },
    myReview: myReview ? serializeReview(myReview) : null,
    permissions: {
      canReview,
      hasReviewed: Boolean(myReview),
    },
  });
};

export const createReview = async (req: Request, res: Response) => {
  if (req.user!.role !== UserRole.CUSTOMER) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only customers can create reviews");
  }

  const { productId, rating, reviewText } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      status: true,
      category: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!product || product.status !== ProductStatus.ACTIVE || !product.category.status) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not available for review");
  }

  const purchased = await hasPurchasedProduct(req.user!.id, productId);

  if (!purchased) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only customers who purchased this product can add a review",
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      productId_customerId: {
        productId,
        customerId: req.user!.id,
      },
    },
  });

  if (existingReview) {
    throw new ApiError(StatusCodes.CONFLICT, "You already submitted a review for this product");
  }

  const review = await prisma.review.create({
    data: {
      productId,
      customerId: req.user!.id,
      rating,
      reviewText,
      status: false,
    },
    include: reviewInclude,
  });

  res.status(StatusCodes.CREATED).json({
    message: "Review submitted successfully and is pending moderation",
    review: serializeReview(review),
  });
};

export const updateReview = async (req: Request, res: Response) => {
  const review = await prisma.review.findUnique({
    where: { reviewId: Number(req.params.id) },
    include: reviewInclude,
  });

  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Review not found");
  }

  const isAdmin = req.user!.role === UserRole.ADMIN;
  const isOwner = review.customerId === req.user!.id;

  if (!isAdmin && !isOwner) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only update your own review");
  }

  const updatedReview = await prisma.review.update({
    where: { reviewId: review.reviewId },
    data: {
      rating: req.body.rating ?? review.rating,
      reviewText: req.body.reviewText ?? review.reviewText,
      status: isOwner && !isAdmin ? false : review.status,
    },
    include: reviewInclude,
  });

  res.status(StatusCodes.OK).json({
    message:
      isOwner && !isAdmin
        ? "Review updated and sent for moderation"
        : "Review updated successfully",
    review: serializeReview(updatedReview),
  });
};

export const deleteReview = async (req: Request, res: Response) => {
  const review = await prisma.review.findUnique({
    where: { reviewId: Number(req.params.id) },
  });

  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Review not found");
  }

  const isAdmin = req.user!.role === UserRole.ADMIN;
  const isOwner = review.customerId === req.user!.id;

  if (!isAdmin && !isOwner) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only delete your own review");
  }

  await prisma.review.delete({
    where: { reviewId: review.reviewId },
  });

  res.status(StatusCodes.OK).json({
    message: isAdmin ? "Review deleted successfully" : "Review removed successfully",
  });
};

export const getReviewsForModeration = async (req: Request, res: Response) => {
  const searchTerm = req.query.search ? String(req.query.search) : undefined;
  const statusFilter = resolveModerationStatusFilter(req.query.status as string | undefined);

  const reviews = await prisma.review.findMany({
    where: {
      status: statusFilter,
      OR: searchTerm
        ? [
            {
              reviewText: {
                contains: searchTerm,
              },
            },
            {
              customer: {
                fullName: {
                  contains: searchTerm,
                },
              },
            },
            {
              customer: {
                email: {
                  contains: searchTerm,
                },
              },
            },
            {
              product: {
                name: {
                  contains: searchTerm,
                },
              },
            },
          ]
        : undefined,
    },
    include: reviewInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  const [pendingCount, approvedCount] = await Promise.all([
    prisma.review.count({ where: { status: false } }),
    prisma.review.count({ where: { status: true } }),
  ]);

  res.status(StatusCodes.OK).json({
    reviews: reviews.map(serializeReview),
    summary: {
      total: reviews.length,
      pendingCount,
      approvedCount,
    },
  });
};

export const moderateReview = async (req: Request, res: Response) => {
  const review = await prisma.review.findUnique({
    where: { reviewId: Number(req.params.id) },
  });

  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Review not found");
  }

  const updatedReview = await prisma.review.update({
    where: { reviewId: review.reviewId },
    data: {
      status: req.body.status,
    },
    include: reviewInclude,
  });

  res.status(StatusCodes.OK).json({
    message: req.body.status ? "Review approved successfully" : "Review moved to pending state",
    review: serializeReview(updatedReview),
  });
};
