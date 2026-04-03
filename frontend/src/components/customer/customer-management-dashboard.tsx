import { Pencil, Trash2 } from "lucide-react";
import type { Customer } from "../../types";
import { formatCurrency, formatDate } from "../../lib/format";
import { getOrderStatusLabel } from "../../lib/order-status";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import { EmptyState } from "../shared/empty-state";

type CustomerManagementDashboardProps = {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
};

export const CustomerManagementDashboard = ({
  customers,
  onEdit,
  onDelete,
}: CustomerManagementDashboardProps) => (
  <Card className="overflow-hidden p-0">
    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Customer Management</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">Dashboard</h3>
      </div>
      <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
        {customers.length} customers
      </span>
    </div>

    {customers.length ? (
      <div className="space-y-4 p-6">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-[28px] border border-slate-100 bg-white/80 p-5">
            <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr),340px] 2xl:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="text-xl font-semibold text-ink">{customer.fullName}</h4>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                      customer.status
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {customer.status ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-2 max-w-full break-all pr-2 text-sm text-slate-600">
                  {customer.email}
                </p>
                <p className="mt-1 max-w-full break-words pr-2 text-sm text-slate-500">
                  {customer.phone ?? "Phone not added"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Joined on {formatDate(customer.createdAt)}
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl bg-brand-50/70 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Order History</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{customer.orderCount} orders</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-center"
                    onClick={() => onEdit(customer)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="soft"
                    className="w-full justify-center"
                    onClick={() => onDelete(customer)}
                    disabled={!customer.status}
                  >
                    <Trash2 className="h-4 w-4" />
                    Deactivate
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] bg-brand-50/50 p-4">
              <p className="text-sm font-medium text-ink">Recent Orders</p>
              {customer.orderHistory.length ? (
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {customer.orderHistory.map((order) => (
                    <div key={order.id} className="rounded-2xl bg-white/85 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-brand-600">
                        {order.orderNumber}
                      </p>
                      <p className="mt-2 text-sm font-medium text-ink">
                        {getOrderStatusLabel(order.status)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{formatCurrency(order.totalAmount)}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  This customer has not placed any orders yet.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="p-6">
        <EmptyState
          title="No customers found"
          description="Create a customer from the admin panel or register a new account from the storefront."
        />
      </div>
    )}
  </Card>
);
