import { ProductStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { serializeProduct } from "../models/product.model.js";
import { ApiError } from "../utils/api-error.js";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const getProducts = async (req: Request, res: Response) => {
  const includeInactive =
    req.user?.role === "ADMIN" && req.query.includeInactive === "true";

  const products = await prisma.product.findMany({
    where: {
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      featured: req.query.featured ? req.query.featured === "true" : undefined,
      status: includeInactive ? undefined : ProductStatus.ACTIVE,
      OR: req.query.search
        ? [
            { name: { contains: String(req.query.search) } },
            { description: { contains: String(req.query.search) } },
          ]
        : undefined,
    },
    include: {
      category: {
        select: {
          categoryId: true,
          categoryName: true,
        },
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  res.status(StatusCodes.OK).json({
    products: products.map(serializeProduct),
  });
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      category: {
        select: {
          categoryId: true,
          categoryName: true,
        },
      },
    },
  });

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }

  res.status(StatusCodes.OK).json({
    product: serializeProduct(product),
  });
};

export const createProduct = async (req: Request, res: Response) => {
  const category = await prisma.category.findFirst({
    where: {
      categoryId: req.body.categoryId,
      status: true,
    },
  });

  if (!category) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "A valid active category is required");
  }

  const baseSlug = slugify(req.body.name);
  const existingSlug = await prisma.product.findUnique({
    where: { slug: baseSlug },
  });

  const product = await prisma.product.create({
    data: {
      ...req.body,
      slug: existingSlug ? `${baseSlug}-${Date.now()}` : baseSlug,
    },
    include: {
      category: {
        select: {
          categoryId: true,
          categoryName: true,
        },
      },
    },
  });

  res.status(StatusCodes.CREATED).json({
    message: "Product created successfully",
    product: serializeProduct(product),
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }

  if (req.body.categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        categoryId: req.body.categoryId,
        status: true,
      },
    });

    if (!category) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "A valid active category is required");
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id: product.id },
    data: {
      ...req.body,
      slug: req.body.name ? `${slugify(req.body.name)}-${product.id}` : product.slug,
    },
    include: {
      category: {
        select: {
          categoryId: true,
          categoryName: true,
        },
      },
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Product updated successfully",
    product: serializeProduct(updatedProduct),
  });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }

  const updatedProduct = await prisma.product.update({
    where: { id: product.id },
    data: {
      status: ProductStatus.INACTIVE,
    },
    include: {
      category: {
        select: {
          categoryId: true,
          categoryName: true,
        },
      },
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Product deactivated successfully",
    product: serializeProduct(updatedProduct),
  });
};
