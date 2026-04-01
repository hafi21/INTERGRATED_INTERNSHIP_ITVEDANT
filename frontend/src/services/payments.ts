import { api } from "./api";
import type { Order, RazorpayCheckoutPayload } from "../types";

export const paymentService = {
  async createRazorpayOrder(orderId: number) {
    const { data } = await api.post<RazorpayCheckoutPayload>("/payments/razorpay/order", {
      orderId,
    });
    return data;
  },
  async verifyRazorpayPayment(payload: {
    orderId: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const { data } = await api.post<{ order: Order }>("/payments/razorpay/verify", payload);
    return data.order;
  },
};
