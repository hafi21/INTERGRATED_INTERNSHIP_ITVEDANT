import { api } from "./api";
import type { Order, PaymentRecord, RazorpayCheckoutPayload } from "../types";

export type PaymentFilterStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

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
  async list(params?: { status?: PaymentFilterStatus }) {
    const { data } = await api.get<{ payments: PaymentRecord[] }>("/payments", { params });
    return data.payments;
  },
  async refund(paymentId: number) {
    const { data } = await api.patch<{ payment: PaymentRecord }>(`/payments/${paymentId}/refund`);
    return data.payment;
  },
};
