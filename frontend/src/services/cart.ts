import { api } from "./api";
import type { CartResponse } from "../types";

export const cartService = {
  async get() {
    const { data } = await api.get<CartResponse>("/cart");
    return data;
  },
  async add(payload: { productId: number; quantity: number }) {
    const { data } = await api.post<CartResponse>("/cart", payload);
    return data;
  },
  async update(id: number, quantity: number) {
    const { data } = await api.patch<CartResponse>(`/cart/${id}`, { quantity });
    return data;
  },
  async remove(id: number) {
    const { data } = await api.delete<CartResponse>(`/cart/${id}`);
    return data;
  },
  async clear() {
    const { data } = await api.delete<CartResponse>("/cart");
    return data;
  },
};

