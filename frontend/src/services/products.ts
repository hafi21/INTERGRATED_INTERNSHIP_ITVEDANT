import { api } from "./api";
import type { Product } from "../types";

export const productService = {
  async list(params?: { categoryId?: number; featured?: boolean; search?: string }) {
    const { data } = await api.get<{ products: Product[] }>("/products", { params });
    return data.products;
  },
  async getById(id: string) {
    const { data } = await api.get<{ product: Product }>(`/products/${id}`);
    return data.product;
  },
};

