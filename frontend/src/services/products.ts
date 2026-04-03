import { api } from "./api";
import type { Product } from "../types";

export type ProductPayload = {
  name: string;
  sku: string;
  description: string;
  price: number;
  inventory: number;
  imageUrl: string;
  featured?: boolean;
  categoryId: number;
  status?: "ACTIVE" | "INACTIVE";
};

export const productService = {
  async list(params?: {
    categoryId?: number;
    featured?: boolean;
    search?: string;
    includeInactive?: boolean;
  }) {
    const { data } = await api.get<{ products: Product[] }>("/products", { params });
    return data.products;
  },
  async getById(id: string) {
    const { data } = await api.get<{ product: Product }>(`/products/${id}`);
    return data.product;
  },
  async create(payload: ProductPayload) {
    const { data } = await api.post<{ product: Product }>("/products", payload);
    return data.product;
  },
  async update(id: number, payload: Partial<ProductPayload>) {
    const { data } = await api.put<{ product: Product }>(`/products/${id}`, payload);
    return data.product;
  },
  async deactivate(id: number) {
    const { data } = await api.delete<{ product: Product }>(`/products/${id}`);
    return data.product;
  },
};
