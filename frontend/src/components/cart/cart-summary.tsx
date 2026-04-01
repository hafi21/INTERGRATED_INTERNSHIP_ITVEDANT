import { CreditCard, Truck } from "lucide-react";
import { Card } from "../shared/card";
import { Button } from "../shared/button";
import { formatCurrency } from "../../lib/format";

export const CartSummary = ({
  subtotal,
  onCheckout,
  loading,
}: {
  subtotal: number;
  onCheckout: () => void;
  loading: boolean;
}) => {
  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal + shipping;

  return (
    <Card className="sticky top-28 space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Checkout</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">Order Summary</h3>
      </div>
      <div className="space-y-3 text-sm text-slate-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-ink">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-brand-600" />
            Shipping
          </span>
          <span className="font-medium text-ink">{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
        </div>
        <div className="border-t border-slate-200 pt-3">
          <div className="flex justify-between text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
      <Button className="w-full" onClick={onCheckout} disabled={loading}>
        <CreditCard className="h-4 w-4" />
        {loading ? "Processing..." : "Place Order"}
      </Button>
    </Card>
  );
};

