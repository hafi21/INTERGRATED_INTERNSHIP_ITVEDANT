import { api } from "./api";
import type { Order } from "../types";

export const orderService = {
  async list() {
    const { data } = await api.get<{ orders: Order[] }>("/orders");
    return data.orders;
  },
  async create(payload: { shippingAddress: string; paymentProvider: "RAZORPAY" | "COD" }) {
    const { data } = await api.post<{ order: Order }>("/orders", payload);
    return data.order;
  },
  async cancel(orderId: number) {
    const { data } = await api.patch<{ order: Order }>(`/orders/${orderId}/cancel`);
    return data.order;
  },
};
