import { Receipt, RotateCcw } from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/format";
import { formatPaymentMethod, getPaymentStatusLabel, getPaymentStatusTone } from "../../lib/payment-status";
import { getOrderStatusLabel, getOrderStatusTone } from "../../lib/order-status";
import type { PaymentRecord } from "../../types";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import { EmptyState } from "../shared/empty-state";

type PaymentManagementDashboardProps = {
  payments: PaymentRecord[];
  refundingPaymentId: number | null;
  onRefund: (payment: PaymentRecord) => void;
};

export const PaymentManagementDashboard = ({
  payments,
  refundingPaymentId,
  onRefund,
}: PaymentManagementDashboardProps) => (
  <Card className="overflow-hidden p-0">
    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Payment Management</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">Transaction Dashboard</h3>
      </div>
      <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
        {payments.length} transactions
      </span>
    </div>

    {payments.length ? (
      <div className="space-y-4 p-6">
        {payments.map((payment) => {
          const canRefund = payment.status === "SUCCESS" && payment.provider === "RAZORPAY";

          return (
            <div key={payment.id} className="rounded-[28px] border border-slate-100 bg-white/80 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm uppercase tracking-[0.3em] text-brand-600">
                      Payment #{payment.id}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${getPaymentStatusTone(payment.status)}`}
                    >
                      {getPaymentStatusLabel(payment.status)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${getOrderStatusTone(payment.order.status)}`}
                    >
                      Order {getOrderStatusLabel(payment.order.status)}
                    </span>
                  </div>

                  <h4 className="mt-3 text-xl font-semibold text-ink">
                    {payment.order.customer.fullName}
                  </h4>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {payment.order.customer.email}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Order {payment.order.orderNumber} placed on {formatDate(payment.order.createdAt)}
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                  <div className="rounded-2xl bg-brand-50/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Amount</p>
                    <p className="mt-2 font-medium text-ink">{formatCurrency(payment.amount)}</p>
                  </div>
                  <div className="rounded-2xl bg-brand-50/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Method</p>
                    <p className="mt-2 font-medium text-ink">
                      {formatPaymentMethod(payment.paymentMethod, payment.provider)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-brand-50/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Processed</p>
                    <p className="mt-2 font-medium text-ink">{formatDate(payment.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
                <div className="rounded-[28px] bg-white/90 p-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Gateway Ref</p>
                      <p className="mt-2 break-all font-medium text-ink">{payment.transactionRef}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Refund Ref</p>
                      <p className="mt-2 break-all font-medium text-ink">
                        {payment.refundReference ?? "Not refunded"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    {payment.status === "REFUNDED" ? (
                      <p>
                        Refunded on {payment.refundedAt ? formatDate(payment.refundedAt) : "the latest update"}.
                      </p>
                    ) : payment.status === "SUCCESS" ? (
                      <p>
                        Payment completed successfully via{" "}
                        {formatPaymentMethod(payment.paymentMethod, payment.provider)}.
                      </p>
                    ) : payment.status === "FAILED" ? (
                      <p>The payment attempt failed and no refund action is available.</p>
                    ) : (
                      <p>This transaction is pending confirmation.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[28px] bg-brand-50/70 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                    <Receipt className="h-4 w-4" />
                    Transaction Details
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600">
                    <div className="flex justify-between gap-4">
                      <span>Payment ID</span>
                      <span className="font-medium text-ink">{payment.id}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Order Number</span>
                      <span className="font-medium text-ink">{payment.order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Payment Method</span>
                      <span className="font-medium text-ink">
                        {formatPaymentMethod(payment.paymentMethod, payment.provider)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Payment Status</span>
                      <span className="font-medium text-ink">{getPaymentStatusLabel(payment.status)}</span>
                    </div>
                  </div>

                  <Button
                    variant={canRefund ? "primary" : "ghost"}
                    onClick={() => onRefund(payment)}
                    disabled={!canRefund || refundingPaymentId === payment.id}
                    className="mt-5 w-full"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {refundingPaymentId === payment.id ? "Refunding..." : "Refund Payment"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="p-6">
        <EmptyState
          title="No payments match this filter"
          description="Complete a few Razorpay transactions to populate the payment management dashboard."
        />
      </div>
    )}
  </Card>
);
