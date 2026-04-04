import { api } from "./api";
import type { ModerationReviewResponse, ProductReviewResponse, Review } from "../types";

export type ReviewPayload = {
  productId: number;
  rating: number;
  reviewText: string;
};

export type UpdateReviewPayload = Partial<Pick<ReviewPayload, "rating" | "reviewText">>;

export const reviewService = {
  async listByProduct(productId: number) {
    const { data } = await api.get<ProductReviewResponse>(`/reviews/product/${productId}`);
    return data;
  },
  async create(payload: ReviewPayload) {
    const { data } = await api.post<{ message: string; review: Review }>("/reviews", payload);
    return data;
  },
  async update(reviewId: number, payload: UpdateReviewPayload) {
    const { data } = await api.put<{ message: string; review: Review }>(`/reviews/${reviewId}`, payload);
    return data;
  },
  async remove(reviewId: number) {
    const { data } = await api.delete<{ message: string }>(`/reviews/${reviewId}`);
    return data;
  },
  async listForModeration(params?: { status?: "pending" | "approved" | "all"; search?: string }) {
    const { data } = await api.get<ModerationReviewResponse>("/reviews/admin/moderation", { params });
    return data;
  },
  async moderate(reviewId: number, status: boolean) {
    const { data } = await api.patch<{ message: string; review: Review }>(
      `/reviews/${reviewId}/moderate`,
      { status },
    );
    return data;
  },
};
