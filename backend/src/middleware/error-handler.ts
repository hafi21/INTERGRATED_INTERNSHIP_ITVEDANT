import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { ApiError } from "../utils/api-error.js";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  void _next;

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: error.issues.map((issue) => issue.message).join(", "),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021" || error.code === "P2022") {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message:
          "Database schema is out of sync. Run the latest Prisma migrations and redeploy.",
        code: error.code,
      });
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Database request failed",
      code: error.code,
    });
  }

  console.error(error);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Something went wrong on the server",
  });
};
