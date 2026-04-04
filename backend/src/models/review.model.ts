type ReviewEntity = {
  reviewId: number;
  productId: number;
  customerId: number;
  rating: number;
  reviewText: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: number;
    fullName: string;
    email: string;
  } | null;
  product?: {
    id: number;
    name: string;
    imageUrl: string;
  } | null;
};

export const serializeReview = (review: ReviewEntity) => ({
  reviewId: review.reviewId,
  productId: review.productId,
  customerId: review.customerId,
  rating: review.rating,
  reviewText: review.reviewText,
  status: review.status,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
  customer: review.customer ?? null,
  product: review.product ?? null,
});
