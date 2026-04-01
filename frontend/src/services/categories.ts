import { api } from "./api";
import type { Category } from "../types";

export const categoryService = {
  async list(includeInactive = false) {
    const { data } = await api.get<{ categories: Category[] }>("/categories", {
      params: includeInactive ? { includeInactive: true } : undefined,
    });
    return data.categories;
  },
  async create(payload: { categoryName: string; description?: string }) {
    const { data } = await api.post<{ category: Category }>("/categories", payload);
    return data.category;
  },
  async update(id: number, payload: { categoryName: string; description?: string }) {
    const { data } = await api.put<{ category: Category }>(`/categories/${id}`, payload);
    return data.category;
  },
  async deactivate(id: number) {
    const { data } = await api.delete<{ category: Category }>(`/categories/${id}`);
    return data.category;
  },
};

