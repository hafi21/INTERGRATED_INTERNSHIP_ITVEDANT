import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

let razorpayInstance: Razorpay | null = null;

const getCredentials = () => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, "Razorpay credentials are not configured");
  }

  return {
    keyId: env.RAZORPAY_KEY_ID,
    keySecret: env.RAZORPAY_KEY_SECRET,
  };
};

export const getRazorpayInstance = () => {
  const { keyId, keySecret } = getCredentials();

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
};

export const getRazorpayKeyId = () => getCredentials().keyId;

export const verifyRazorpaySignature = (payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) => {
  const { keySecret } = getCredentials();
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${payload.razorpayOrderId}|${payload.razorpayPaymentId}`)
    .digest("hex");

  return generatedSignature === payload.razorpaySignature;
};
