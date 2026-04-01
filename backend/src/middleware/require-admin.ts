import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new ApiError(StatusCodes.FORBIDDEN, "Admin access is required"));
  }

  next();
};

