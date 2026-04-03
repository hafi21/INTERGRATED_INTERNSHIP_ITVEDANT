import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { signToken } from "../utils/jwt.js";

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
} as const;

export const register = async (req: Request, res: Response) => {
  const { fullName, email, phone, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      passwordHash,
    },
    select: userSelect,
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(StatusCodes.CREATED).json({
    token,
    user,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  if (!user.status) {
    throw new ApiError(StatusCodes.FORBIDDEN, "This account has been deactivated");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(StatusCodes.OK).json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
};

export const me = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: userSelect,
  });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (!user.status) {
    throw new ApiError(StatusCodes.FORBIDDEN, "This account is inactive");
  }

  res.status(StatusCodes.OK).json({ user });
};
