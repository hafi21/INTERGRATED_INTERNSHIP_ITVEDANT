import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { AdminOrderDashboard } from "../components/orders/admin-order-dashboard";
import { ConfirmModal } from "../components/shared/confirm-modal";
import { LoadingSkeleton } from "../components/shared/loading-skeleton";
import { SectionHeading } from "../components/shared/section-heading";
import { orderService, type OrderFilterStatus } from "../services/orders";
import type { Order } from "../types";

const filterOptions: Array<{ value: "ALL" | OrderFilterStatus; label: string }> = [
  { value: "ALL", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const AdminOrdersPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderFilterStatus>("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", "admin", statusFilter],
    queryFn: () =>
      orderService.list({
        scope: "all",
        status: statusFilter === "ALL" ? undefined : statusFilter,
      }),
  });

  const getErrorMessage = (error: unknown, fallback: string) =>
    axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: "PENDING" | "SHIPPED" | "DELIVERED" }) =>
      orderService.updateStatus(orderId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["shipment-tracking"] });
      await queryClient.invalidateQueries({ queryKey: ["shipping"] });
      toast.success("Order status updated");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Could not update order status")),
    onSettled: () => setUpdatingOrderId(null),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => orderService.cancel(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled successfully");
      setCancelTarget(null);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Could not cancel order")),
    onSettled: () => setCancelOrderId(null),
  });

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === "PENDING").length;
    const shipped = orders.filter((order) => order.status === "PROCESSING").length;
    const delivered = orders.filter((order) => order.status === "FULFILLED").length;
    const cancelled = orders.filter((order) => order.status === "CANCELLED").length;

    return { total: orders.length, pending, shipped, delivered, cancelled };
  }, [orders]);

  return (
    <main className="section-shell py-14">
      <SectionHeading
        eyebrow="Part 3 Submission Module"
        title="Admin order management with status filters and order actions"
        description="This dashboard completes the order management assignment with all-customer order visibility, status-based filtering, shipped and delivered updates, and soft cancellation support."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Orders</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{stats.total}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pending</p>
          <p className="mt-3 text-3xl font-semibold text-brand-700">{stats.pending}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Shipped</p>
          <p className="mt-3 text-3xl font-semibold text-amber-700">{stats.shipped}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Delivered</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">{stats.delivered}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Cancelled</p>
          <p className="mt-3 text-3xl font-semibold text-slate-500">{stats.cancelled}</p>
        </div>
      </div>

      <div className="mt-8 max-w-sm">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "ALL" | OrderFilterStatus)}
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
          <AdminOrderDashboard
            orders={orders}
            updatingOrderId={updatingOrderId}
            cancellingOrderId={cancelOrderId}
            onShip={(order) => {
              setUpdatingOrderId(order.id);
              updateStatusMutation.mutate({ orderId: order.id, status: "SHIPPED" });
            }}
            onDeliver={(order) => {
              setUpdatingOrderId(order.id);
              updateStatusMutation.mutate({ orderId: order.id, status: "DELIVERED" });
            }}
            onCancel={setCancelTarget}
          />
        )}
      </div>

      <ConfirmModal
        open={Boolean(cancelTarget)}
        title="Cancel this order?"
        description="This will mark the order as cancelled and restore the reserved product quantity back into stock. Orders that are already shipped or delivered cannot be cancelled."
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (!cancelTarget) {
            return;
          }

          setCancelOrderId(cancelTarget.id);
          cancelMutation.mutate(cancelTarget.id);
        }}
        confirmLabel="Cancel Order"
      />
    </main>
  );
};
