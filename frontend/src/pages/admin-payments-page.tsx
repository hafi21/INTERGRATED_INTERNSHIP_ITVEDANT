import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { PaymentManagementDashboard } from "../components/payments/payment-management-dashboard";
import { ConfirmModal } from "../components/shared/confirm-modal";
import { LoadingSkeleton } from "../components/shared/loading-skeleton";
import { SectionHeading } from "../components/shared/section-heading";
import { paymentService, type PaymentFilterStatus } from "../services/payments";
import type { PaymentRecord } from "../types";

const filterOptions: Array<{ value: "ALL" | PaymentFilterStatus; label: string }> = [
  { value: "ALL", label: "All Transactions" },
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

export const AdminPaymentsPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"ALL" | PaymentFilterStatus>("ALL");
  const [refundTarget, setRefundTarget] = useState<PaymentRecord | null>(null);
  const [refundingPaymentId, setRefundingPaymentId] = useState<number | null>(null);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", "admin", statusFilter],
    queryFn: () =>
      paymentService.list({
        status: statusFilter === "ALL" ? undefined : statusFilter,
      }),
  });

  const getErrorMessage = (error: unknown, fallback: string) =>
    axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

  const refundMutation = useMutation({
    mutationFn: (paymentId: number) => paymentService.refund(paymentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);
      toast.success("Payment refunded successfully");
      setRefundTarget(null);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Could not refund payment")),
    onSettled: () => setRefundingPaymentId(null),
  });

  const stats = useMemo(() => {
    const paid = payments.filter((payment) => payment.status === "SUCCESS").length;
    const pending = payments.filter((payment) => payment.status === "PENDING").length;
    const failed = payments.filter((payment) => payment.status === "FAILED").length;
    const refunded = payments.filter((payment) => payment.status === "REFUNDED").length;

    return { total: payments.length, paid, pending, failed, refunded };
  }, [payments]);

  return (
    <main className="section-shell py-14">
      <SectionHeading
        eyebrow="Part 6 Submission Module"
        title="Admin payment dashboard with Razorpay transaction history and refunds"
        description="This completes the payment management assignment using the existing Razorpay integration, an admin transaction dashboard, and refund tracking for completed payments."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Transactions</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{stats.total}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Paid</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">{stats.paid}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pending</p>
          <p className="mt-3 text-3xl font-semibold text-brand-700">{stats.pending}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Failed</p>
          <p className="mt-3 text-3xl font-semibold text-rose-600">{stats.failed}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Refunded</p>
          <p className="mt-3 text-3xl font-semibold text-amber-700">{stats.refunded}</p>
        </div>
      </div>

      <div className="mt-8 max-w-sm">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "ALL" | PaymentFilterStatus)}
          className="form-select"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-10">
        {isLoading ? (
          <div className="grid gap-6">
            <LoadingSkeleton className="h-[260px] w-full" />
            <LoadingSkeleton className="h-[260px] w-full" />
          </div>
        ) : (
          <PaymentManagementDashboard
            payments={payments}
            refundingPaymentId={refundingPaymentId}
            onRefund={setRefundTarget}
          />
        )}
      </div>

      <ConfirmModal
        open={Boolean(refundTarget)}
        title="Refund this payment?"
        description="This will initiate a full refund through Razorpay, log the refund reference, and update the transaction history in the admin dashboard."
        onClose={() => setRefundTarget(null)}
        onConfirm={() => {
          if (!refundTarget) {
            return;
          }

          setRefundingPaymentId(refundTarget.id);
          refundMutation.mutate(refundTarget.id);
        }}
        confirmLabel="Refund Payment"
      />
    </main>
  );
};
