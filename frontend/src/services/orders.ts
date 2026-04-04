import { api } from "./api";
import type { Order } from "../types";

export type OrderFilterStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export const orderService = {
  async list(params?: { scope?: "all"; status?: OrderFilterStatus }) {
    const { data } = await api.get<{ orders: Order[] }>("/orders", { params });
    return data.orders;
  },
  async create(payload: {
    shippingAddress: string;
    paymentProvider: "RAZORPAY" | "COD";
    couponCode?: string;
  }) {
    const { data } = await api.post<{ order: Order }>("/orders", payload);
    return data.order;
  },
  async cancel(orderId: number) {
    const { data } = await api.patch<{ order: Order }>(`/orders/${orderId}/cancel`);
    return data.order;
  },
  async updateStatus(orderId: number, status: "PENDING" | "SHIPPED" | "DELIVERED") {
    const { data } = await api.patch<{ order: Order }>(`/orders/${orderId}/status`, { status });
    return data.order;
  },
};
