import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required"));
  }

  try {
    const token = authorization.split(" ")[1];
    req.user = verifyToken(token);
    next();
  } catch {
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
};

