import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

export const authenticateOptional = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = authorization.split(" ")[1];
    req.user = verifyToken(token);
  } catch {
    req.user = undefined;
  }

  next();
};
