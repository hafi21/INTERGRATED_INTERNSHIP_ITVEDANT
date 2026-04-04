import { TicketPercent } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import type { Coupon } from "../../types";

type CouponMarqueeProps = {
  coupons: Coupon[];
};

const CouponChip = ({ coupon }: { coupon: Coupon }) => {
  const now = new Date();
  const validFrom = new Date(coupon.validFrom);
  const isLive = validFrom <= now;
  const discountLabel =
    coupon.discountType === "PERCENTAGE"
      ? `${coupon.discountValue}% OFF`
      : `${formatCurrency(coupon.discountValue)} OFF`;

  const minimumOrderLabel =
    coupon.minimumOrderAmount !== null
      ? `Min order ${formatCurrency(coupon.minimumOrderAmount)}`
      : "No minimum order";

  return (
    <div className="flex min-w-max items-center gap-3 rounded-full border border-brand-100 bg-white/90 px-5 py-2.5 shadow-soft">
      <span className="rounded-full bg-brand-50 p-2 text-brand-600">
        <TicketPercent className="h-4 w-4" />
      </span>
      <p className="text-sm font-semibold text-ink">{coupon.couponCode}</p>
      <span className="text-xs uppercase tracking-[0.2em] text-brand-600">{discountLabel}</span>
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
          isLive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        {isLive
          ? "Live"
          : `Starts ${validFrom.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })}`}
      </span>
      <span className="text-sm text-slate-500">{minimumOrderLabel}</span>
    </div>
  );
};

export const CouponMarquee = ({ coupons }: CouponMarqueeProps) => {
  const shouldAnimate = coupons.length > 1;

  return (
    <section className="mb-8 overflow-hidden rounded-[28px] border border-brand-100 bg-gradient-to-r from-brand-50/60 via-white to-brand-50/40 px-3 py-3">
      {coupons.length ? (
        <div className={shouldAnimate ? "coupon-marquee-track" : "flex items-center gap-3"}>
          {(shouldAnimate ? [...coupons, ...coupons] : coupons).map((coupon, index) => (
            <CouponChip key={`${coupon.couponId}-${index}`} coupon={coupon} />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm">
          <span className="rounded-full bg-brand-50 p-2 text-brand-600">
            <TicketPercent className="h-4 w-4" />
          </span>
          <p className="font-medium text-slate-600">
            No active coupons right now. Newly created admin coupons will appear here automatically.
          </p>
        </div>
      )}
    </section>
  );
};
