import { PackageCheck, Truck, XCircle } from "lucide-react";
import { useState } from "react";
import type { Order } from "../../types";
import { formatCurrency, formatDate } from "../../lib/format";
import { getOrderStatusLabel, getOrderStatusTone } from "../../lib/order-status";
import { ShippingInfoModal } from "./shipping-info-modal";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import { EmptyState } from "../shared/empty-state";

type AdminOrderDashboardProps = {
  orders: Order[];
  updatingOrderId: number | null;
  cancellingOrderId: number | null;
  onShip: (order: Order) => void;
  onDeliver: (order: Order) => void;
  onCancel: (order: Order) => void;
};

export const AdminOrderDashboard = ({
  orders,
  updatingOrderId,
  cancellingOrderId,
  onShip,
  onDeliver,
  onCancel,
}: AdminOrderDashboardProps) => {
  const [shippingModalOrderId, setShippingModalOrderId] = useState<number | null>(null);

  return (
  <Card className="overflow-hidden p-0">
    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Order Management</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">Admin Dashboard</h3>
      </div>
      <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
        {orders.length} orders
      </span>
    </div>

    {orders.length ? (
      <div className="space-y-4 p-6">
        {orders.map((order) => {
          const isUpdating = updatingOrderId === order.id;
          const isCancelling = cancellingOrderId === order.id;
          const canShip = order.status === "PENDING" || order.status === "PAID";
          const canDeliver = order.status === "PROCESSING";
          const canCancel =
            order.status !== "PROCESSING" &&
            order.status !== "FULFILLED" &&
            order.status !== "PAID" &&
            order.status !== "CANCELLED";

          return (
            <div key={order.id} className="rounded-[28px] border border-slate-100 bg-white/80 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm uppercase tracking-[0.3em] text-brand-600">
                      {order.orderNumber}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${getOrderStatusTone(order.status)}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                  <h4 className="mt-3 text-xl font-semibold text-ink">
                    {order.customer?.fullName ?? "Customer"}
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">{order.customer?.email ?? "No email"}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Ordered on {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                  <div className="rounded-2xl bg-brand-50/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Ship To</p>
                    <p className="mt-2 font-medium text-ink">{order.shippingAddress}</p>
                  </div>
                  <div className="rounded-2xl bg-brand-50/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Items</p>
                    <p className="mt-2 font-medium text-ink">{order.items.length} line items</p>
                  </div>
                  <div className="rounded-2xl bg-brand-50/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total</p>
                    <p className="mt-2 font-medium text-ink">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{item.product.name}</p>
                        <p className="text-sm text-slate-500">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-ink">
                        {formatCurrency(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rounded-[28px] bg-brand-50/70 p-5">
                  <div className="grid gap-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{formatCurrency(order.shippingFee)}</span>
                    </div>
                    {order.discountAmount > 0 ? (
                      <div className="flex justify-between">
                        <span>
                          Discount{order.coupon?.couponCode ? ` (${order.coupon.couponCode})` : ""}
                        </span>
                        <span className="text-emerald-600">
                          - {formatCurrency(order.discountAmount)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between border-t border-brand-100 pt-2 text-base font-semibold text-ink">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    <Button
                      variant="ghost"
                      onClick={() => setShippingModalOrderId(order.id)}
                    >
                      <Truck className="h-4 w-4" />
                      Shipping Info
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onShip(order)}
                      disabled={!canShip || isUpdating || isCancelling}
                    >
                      <Truck className="h-4 w-4" />
                      {isUpdating && canShip ? "Saving..." : "Mark Shipped"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onDeliver(order)}
                      disabled={!canDeliver || isUpdating || isCancelling}
                    >
                      <PackageCheck className="h-4 w-4" />
                      {isUpdating && canDeliver ? "Saving..." : "Mark Delivered"}
                    </Button>
                    <Button
                      variant="soft"
                      onClick={() => onCancel(order)}
                      disabled={!canCancel || isUpdating || isCancelling}
                    >
                      <XCircle className="h-4 w-4" />
                      {isCancelling ? "Cancelling..." : "Cancel"}
                    </Button>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white/80 p-4 text-sm text-slate-600">
                    {order.payment?.status === "REFUNDED"
                      ? `Payment refunded${order.payment.refundReference ? ` with ref ${order.payment.refundReference}` : ""}.`
                      : order.payment?.status === "SUCCESS"
                      ? `Payment completed via ${order.payment.provider}`
                      : order.status === "CANCELLED"
                        ? "This order has been cancelled."
                        : "Payment is pending or will be collected on delivery."}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="p-6">
        <EmptyState
          title="No orders match this filter"
          description="Change the status filter or place a few test orders to populate the admin dashboard."
        />
      </div>
    )}

    {shippingModalOrderId && (
      <ShippingInfoModal
        orderId={shippingModalOrderId}
        isOpen={true}
        onClose={() => setShippingModalOrderId(null)}
      />
    )}
  </Card>
  );
};
