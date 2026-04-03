import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { serializeCustomer } from "../models/customer.model.js";
import { ApiError } from "../utils/api-error.js";

const customerInclude = {
  orders: {
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  },
  _count: {
    select: {
      orders: true,
    },
  },
} as const;

export const getCustomers = async (_req: Request, res: Response) => {
  const customers = await prisma.user.findMany({
    where: {
      role: UserRole.CUSTOMER,
    },
    include: customerInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(StatusCodes.OK).json({
    customers: customers.map(serializeCustomer),
  });
};

export const createCustomer = async (req: Request, res: Response) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: req.body.email },
  });

  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, "A customer with this email already exists");
  }

  const passwordHash = await bcrypt.hash(req.body.password, 12);

  const customer = await prisma.user.create({
    data: {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      passwordHash,
      role: UserRole.CUSTOMER,
      status: true,
    },
    include: customerInclude,
  });

  res.status(StatusCodes.CREATED).json({
    message: "Customer created successfully",
    customer: serializeCustomer(customer),
  });
};

export const updateCustomer = async (req: Request, res: Response) => {
  const customer = await prisma.user.findFirst({
    where: {
      id: Number(req.params.id),
      role: UserRole.CUSTOMER,
    },
    include: customerInclude,
  });

  if (!customer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }

  if (req.body.email && req.body.email !== customer.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, "A customer with this email already exists");
    }
  }

  const passwordHash = req.body.password
    ? await bcrypt.hash(req.body.password, 12)
    : undefined;

  const updatedCustomer = await prisma.user.update({
    where: { id: customer.id },
    data: {
      fullName: req.body.fullName ?? customer.fullName,
      email: req.body.email ?? customer.email,
      phone: req.body.phone !== undefined ? req.body.phone : customer.phone,
      status: req.body.status ?? customer.status,
      passwordHash: passwordHash ?? customer.passwordHash,
    },
    include: customerInclude,
  });

  res.status(StatusCodes.OK).json({
    message: "Customer updated successfully",
    customer: serializeCustomer(updatedCustomer),
  });
};

export const deactivateCustomer = async (req: Request, res: Response) => {
  const customer = await prisma.user.findFirst({
    where: {
      id: Number(req.params.id),
      role: UserRole.CUSTOMER,
    },
    include: customerInclude,
  });

  if (!customer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }

  const updatedCustomer = await prisma.user.update({
    where: { id: customer.id },
    data: {
      status: false,
    },
    include: customerInclude,
  });

  res.status(StatusCodes.OK).json({
    message: "Customer deactivated successfully",
    customer: serializeCustomer(updatedCustomer),
  });
};
