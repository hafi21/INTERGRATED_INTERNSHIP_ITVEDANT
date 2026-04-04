import { Pencil, TicketPercent, Trash2 } from "lucide-react";
import type { Coupon } from "../../types";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import { EmptyState } from "../shared/empty-state";

type CouponDashboardProps = {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDeactivate: (coupon: Coupon) => void;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const CouponDashboard = ({ coupons, onEdit, onDeactivate }: CouponDashboardProps) => (
  <Card className="overflow-hidden p-0">
    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Coupon Management</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">Dashboard</h3>
      </div>
      <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
        {coupons.length} coupons
      </span>
    </div>

    {coupons.length ? (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/80 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Discount</th>
              <th className="px-6 py-4 font-medium">Validity</th>
              <th className="px-6 py-4 font-medium">Usage</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.couponId} className="border-t border-slate-100 align-top">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-2xl bg-brand-50 p-2 text-brand-600">
                      <TicketPercent className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{coupon.couponCode}</p>
                      <p className="text-xs text-slate-500">
                        {coupon.minimumOrderAmount !== null
                          ? `Min order ₹${coupon.minimumOrderAmount.toFixed(2)}`
                          : "No minimum order"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}%`
                    : `₹${coupon.discountValue.toFixed(2)}`}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <p>{formatDate(coupon.validFrom)} → {formatDate(coupon.validTo)}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <p>
                    {coupon.usedCount}/{coupon.usageLimit}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                      !coupon.status
                        ? "bg-slate-100 text-slate-500"
                        : coupon.isExpired
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {!coupon.status ? "Inactive" : coupon.isExpired ? "Expired" : "Active"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => onEdit(coupon)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="soft"
                      onClick={() => onDeactivate(coupon)}
                      disabled={!coupon.status}
                    >
                      <Trash2 className="h-4 w-4" />
                      Deactivate
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="p-6">
        <EmptyState
          title="No coupons created yet"
          description="Create your first coupon to enable discounts at checkout."
        />
      </div>
    )}
  </Card>
);
