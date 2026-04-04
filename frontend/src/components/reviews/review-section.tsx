import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { MessageSquare, Pencil, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/use-auth";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import { LoadingSkeleton } from "../shared/loading-skeleton";
import { reviewService } from "../../services/reviews";

type ReviewSectionProps = {
  productId: number;
};

const formatReviewDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const Stars = ({
  rating,
  interactive = false,
  onSelect,
  size = 18,
}: {
  rating: number;
  interactive?: boolean;
  onSelect?: (value: number) => void;
  size?: number;
}) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, index) => {
      const value = index + 1;
      const filled = value <= rating;

      return interactive ? (
        <button
          key={value}
          type="button"
          onClick={() => onSelect?.(value)}
          className="transition hover:scale-105"
          aria-label={`Rate ${value} out of 5`}
        >
          <Star
            size={size}
            className={filled ? "fill-brand-500 text-brand-500" : "text-slate-300"}
          />
        </button>
      ) : (
        <Star
          key={value}
          size={size}
          className={filled ? "fill-brand-500 text-brand-500" : "text-slate-300"}
        />
      );
    })}
  </div>
);

export const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => reviewService.listByProduct(productId),
  });

  const myReview = data?.myReview ?? null;
  const canReview = data?.permissions.canReview ?? false;
  const hasReviewed = data?.permissions.hasReviewed ?? false;

  useEffect(() => {
    if (!myReview) {
      return;
    }

    setRating(myReview.rating);
    setReviewText(myReview.reviewText);
  }, [myReview]);

  const getErrorMessage = (error: unknown, fallback: string) =>
    axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

  const createMutation = useMutation({
    mutationFn: () => reviewService.create({ productId, rating, reviewText }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      setReviewText("");
      setRating(5);
      setIsEditing(false);
      toast.success(response.message);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Unable to submit review")),
  });

  const updateMutation = useMutation({
    mutationFn: () => reviewService.update(myReview!.reviewId, { rating, reviewText }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      setIsEditing(false);
      toast.success(response.message);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Unable to update review")),
  });

  const deleteMutation = useMutation({
    mutationFn: () => reviewService.remove(myReview!.reviewId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      setReviewText("");
      setRating(5);
      setIsEditing(false);
      toast.success(response.message);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Unable to delete review")),
  });

  const isFormVisible =
    Boolean(user?.role === "CUSTOMER") && (isEditing || (!hasReviewed && canReview));
  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const reviewSummaryLabel = useMemo(() => {
    const totalReviews = data?.summary.totalReviews ?? 0;

    if (!totalReviews) {
      return "No ratings yet";
    }

    return `${totalReviews} ${totalReviews === 1 ? "review" : "reviews"}`;
  }, [data?.summary.totalReviews]);

  const submitReview = () => {
    if (!reviewText.trim()) {
      toast.error("Please add your review text");
      return;
    }

    if (myReview) {
      updateMutation.mutate();
      return;
    }

    if (!canReview) {
      toast.error("You can review this product only after purchase");
      return;
    }

    createMutation.mutate();
  };

  return (
    <section id="reviews" className="mt-10 scroll-mt-28">
      <Card className="rounded-[32px] p-7 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-brand-600">Reviews & Ratings</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Customer feedback</h2>
          </div>
          <div className="rounded-2xl bg-brand-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <Stars rating={Math.round(data?.summary.averageRating ?? 0)} />
              <div>
                <p className="text-base font-semibold text-ink">
                  {(data?.summary.averageRating ?? 0).toFixed(1)} / 5
                </p>
                <p className="text-xs text-slate-500">{reviewSummaryLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-3">
            <LoadingSkeleton className="h-28 w-full" />
            <LoadingSkeleton className="h-28 w-full" />
          </div>
        ) : (
          <>
            {user?.role === "CUSTOMER" ? (
              <div className="mt-6 rounded-[24px] border border-brand-100 bg-white/80 p-5">
                {myReview && !isEditing ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold text-ink">Your review</p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                              myReview.status
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {myReview.status ? "Approved" : "Pending"}
                          </span>
                        </div>
                        <Stars rating={myReview.rating} />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="ghost" onClick={() => setIsEditing(true)} disabled={isBusy}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="soft"
                          onClick={() => deleteMutation.mutate()}
                          className="text-red-600 hover:bg-red-50"
                          disabled={isBusy}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm leading-7 text-slate-600">{myReview.reviewText}</p>
                    <p className="text-xs text-slate-500">
                      Updated on {formatReviewDate(myReview.updatedAt)}
                    </p>
                  </div>
                ) : isFormVisible ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-ink">
                        {isEditing ? "Update your review" : "Write a review"}
                      </p>
                      <Stars rating={rating} interactive onSelect={setRating} />
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(event) => setReviewText(event.target.value)}
                      rows={4}
                      placeholder="Share product quality, delivery experience, and overall satisfaction..."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={submitReview} disabled={isBusy}>
                        {isEditing ? "Update review" : "Submit review"}
                      </Button>
                      {isEditing ? (
                        <Button
                          variant="ghost"
                          disabled={isBusy}
                          onClick={() => {
                            setIsEditing(false);
                            if (myReview) {
                              setRating(myReview.rating);
                              setReviewText(myReview.reviewText);
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500">
                      Customer review updates are re-checked by admin moderation before publishing.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-slate-600">
                    You can submit a review after this product is purchased and paid from your account.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/80 p-5 text-sm text-slate-600">
                Login as a customer to write and manage your review.
              </div>
            )}

            <div className="mt-7 space-y-4">
              {data?.reviews.length ? (
                data.reviews.map((review) => (
                  <article key={review.reviewId} className="rounded-[24px] border border-slate-200 bg-white/90 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{review.customer?.fullName ?? "Customer"}</p>
                        <p className="text-xs text-slate-500">{formatReviewDate(review.createdAt)}</p>
                      </div>
                      <Stars rating={review.rating} />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{review.reviewText}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/80 p-8 text-center">
                  <MessageSquare className="mx-auto h-6 w-6 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-slate-600">No approved reviews yet.</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Be the first verified customer to share your feedback.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </section>
  );
};
