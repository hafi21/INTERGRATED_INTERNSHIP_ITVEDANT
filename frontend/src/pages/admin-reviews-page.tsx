import { useDeferredValue, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, Search, Star, Trash2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../components/shared/button";
import { Card } from "../components/shared/card";
import { EmptyState } from "../components/shared/empty-state";
import { LoadingSkeleton } from "../components/shared/loading-skeleton";
import { SectionHeading } from "../components/shared/section-heading";
import { reviewService } from "../services/reviews";

type ReviewStatusFilter = "all" | "pending" | "approved";

const formatReviewDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const AdminReviewsPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>("pending");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", "admin", statusFilter, deferredSearch],
    queryFn: () =>
      reviewService.listForModeration({
        status: statusFilter,
        search: deferredSearch || undefined,
      }),
  });

  const getErrorMessage = (error: unknown, fallback: string) =>
    axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

  const moderateMutation = useMutation({
    mutationFn: ({ reviewId, status }: { reviewId: number; status: boolean }) =>
      reviewService.moderate(reviewId, status),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success(response.message);
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, "Could not update review status")),
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => reviewService.remove(reviewId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success(response.message);
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, "Could not delete review")),
  });

  const summary = useMemo(
    () =>
      data?.summary ?? {
        total: 0,
        pendingCount: 0,
        approvedCount: 0,
      },
    [data?.summary],
  );

  return (
    <main className="section-shell py-14">
      <SectionHeading
        eyebrow="Review Operations"
        title="Review moderation"
        description="Moderate customer feedback, approve trusted reviews, and keep product ratings credible."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Visible in this view</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{summary.total}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pending Moderation</p>
          <p className="mt-3 text-3xl font-semibold text-amber-700">{summary.pendingCount}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Approved Reviews</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">{summary.approvedCount}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-[220px,1fr]">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as ReviewStatusFilter)}
          className="form-select"
        >
          <option value="all">All Reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>

        <label className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer, email, product, or review text"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-4">
            <LoadingSkeleton className="h-40 w-full" />
            <LoadingSkeleton className="h-40 w-full" />
          </div>
        ) : data?.reviews.length ? (
          <div className="space-y-4">
            {data.reviews.map((review) => (
              <Card key={review.reviewId} className="rounded-[24px] border border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold text-ink">
                        {review.customer?.fullName ?? "Customer"}
                      </p>
                      <span className="text-xs text-slate-500">{review.customer?.email}</span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                          review.status
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {review.status ? "Approved" : "Pending"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <p className="font-medium text-ink">{review.product?.name ?? "Product"}</p>
                      <span>•</span>
                      <p>{formatReviewDate(review.createdAt)}</p>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-brand-600">
                        <Star className="h-4 w-4 fill-brand-500" />
                        <span>{review.rating}/5</span>
                      </div>
                    </div>

                    <p className="max-w-3xl text-sm leading-7 text-slate-600">{review.reviewText}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        moderateMutation.mutate({
                          reviewId: review.reviewId,
                          status: !review.status,
                        })
                      }
                      disabled={moderateMutation.isPending || deleteMutation.isPending}
                    >
                      {review.status ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          Mark Pending
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="soft"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => deleteMutation.mutate(review.reviewId)}
                      disabled={moderateMutation.isPending || deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              title="No reviews found"
              description="No reviews match the selected moderation filter. Try another filter or search term."
            />
          </Card>
        )}
      </div>
    </main>
  );
};
