import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthenticatedUser } from "../types/auth.js";

const jwtOptions: SignOptions = {
  expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
};

export const signToken = (user: AuthenticatedUser) =>
  jwt.sign(user, env.JWT_SECRET, jwtOptions);

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
