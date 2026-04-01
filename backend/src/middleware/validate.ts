import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/api-error.js";

export const validate =
  (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return next(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          result.error.issues.map((issue) => issue.message).join(", "),
        ),
      );
    }

    req.body = result.data.body;
    req.params = result.data.params;
    req.query = result.data.query;
    next();
  };

