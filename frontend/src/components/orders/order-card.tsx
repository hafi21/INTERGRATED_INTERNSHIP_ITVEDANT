import { motion } from "framer-motion";
import { CreditCard, XCircle, Truck } from "lucide-react";
import type { Order } from "../../types";
import { formatCurrency, formatDate } from "../../lib/format";
import { getOrderStatusLabel, getOrderStatusTone } from "../../lib/order-status";
import { Button } from "../shared/button";
import { Card } from "../shared/card";

export const OrderCard = ({
  order,
  onPay,
  onCancel,
  loading,
  cancelLoading,
}: {
  order: Order;
  onPay: () => void;
  onCancel: () => void;
  loading: boolean;
  cancelLoading: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.45 }}
  >
    <Card className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-600">{order.orderNumber}</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">{formatDate(order.createdAt)}</h3>
        </div>
        <div
          className={`rounded-full px-4 py-2 text-sm font-semibold ${getOrderStatusTone(order.status)}`}
        >
          {getOrderStatusLabel(order.status)}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3">
              <img src={item.product.imageUrl} alt={item.product.name} className="h-14 w-14 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{item.product.name}</p>
                <p className="text-sm text-slate-500">
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <span className="text-sm font-semibold text-ink">{formatCurrency(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-[28px] bg-brand-50/70 p-5">
          <p className="text-sm text-slate-600">Ship to</p>
          <p className="font-medium text-ink">{order.shippingAddress}</p>
          <div className="grid gap-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-brand-100 pt-2 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
          
          {/* Tracking Details */}
          {order.shipping && (order.shipping.courierService || order.shipping.trackingNumber) && (
            <div className="mt-4 rounded-2xl border-2 border-brand-200 bg-brand-50/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-4 w-4 text-brand-600" />
                <h4 className="font-semibold text-ink">Tracking Information</h4>
              </div>
              <div className="space-y-2 text-sm">
                {order.shipping.courierService && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Courier Service</p>
                    <p className="font-medium text-ink">{order.shipping.courierService}</p>
                  </div>
                )}
                {order.shipping.trackingNumber && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Tracking Number</p>
                    <p className="font-medium text-ink break-all">{order.shipping.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!order.payment && order.status !== "CANCELLED" ? (
            <div className="space-y-3">
              <Button onClick={onPay} disabled={loading || cancelLoading} className="w-full">
                <CreditCard className="h-4 w-4" />
                {loading ? "Opening..." : "Pay with Razorpay"}
              </Button>
              {order.status === "PENDING" ? (
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  disabled={loading || cancelLoading}
                  className="w-full"
                >
                  <XCircle className="h-4 w-4" />
                  {cancelLoading ? "Cancelling..." : "Cancel Order"}
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/80 p-4 text-sm text-slate-600">
              {order.payment?.status === "REFUNDED"
                ? `Refunded via ${order.payment.provider}${order.payment.refundReference ? ` with refund ref ${order.payment.refundReference}` : ""}`
                : order.status === "CANCELLED"
                ? "This order has been cancelled."
                : `Paid via ${order.payment?.provider} with ref ${order.payment?.transactionRef}`}
            </div>
          )}
        </div>
      </div>
    </Card>
  </motion.div>
);
