import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { serializeCategory } from "../models/category.model.js";
import { ApiError } from "../utils/api-error.js";

export const getCategories = async (req: Request, res: Response) => {
  const includeInactive =
    req.user?.role === "ADMIN" && req.query.includeInactive === "true";

  const categories = await prisma.category.findMany({
    where: includeInactive ? {} : { status: true },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json({
    categories: categories.map(serializeCategory),
  });
};

export const createCategory = async (req: Request, res: Response) => {
  const category = await prisma.category.create({
    data: {
      categoryName: req.body.categoryName,
      description: req.body.description,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  res.status(StatusCodes.CREATED).json({
    message: "Category created successfully",
    category: serializeCategory(category),
  });
};

export const updateCategory = async (req: Request, res: Response) => {
  const category = await prisma.category.findUnique({
    where: { categoryId: Number(req.params.id) },
  });

  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }

  const updatedCategory = await prisma.category.update({
    where: { categoryId: category.categoryId },
    data: {
      categoryName: req.body.categoryName ?? category.categoryName,
      description: req.body.description ?? category.description,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Category updated successfully",
    category: serializeCategory(updatedCategory),
  });
};

export const softDeleteCategory = async (req: Request, res: Response) => {
  const category = await prisma.category.findUnique({
    where: { categoryId: Number(req.params.id) },
  });

  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }

  const deactivatedCategory = await prisma.category.update({
    where: { categoryId: category.categoryId },
    data: {
      status: false,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Category deactivated successfully",
    category: serializeCategory(deactivatedCategory),
  });
};

