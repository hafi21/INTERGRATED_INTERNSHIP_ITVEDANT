import axios from "axios";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CartSummary } from "../components/cart/cart-summary";
import { Button } from "../components/shared/button";
import { Card } from "../components/shared/card";
import { EmptyState } from "../components/shared/empty-state";
import { formatCurrency } from "../lib/format";
import { cartService } from "../services/cart";
import { orderService } from "../services/orders";

export const CartPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState(
    "24 Meridian Avenue, Bengaluru, Karnataka 560001",
  );
  const [paymentProvider, setPaymentProvider] = useState<"RAZORPAY" | "COD">(
    "RAZORPAY",
  );

  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartService.get(),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      cartService.update(id, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => toast.error("Unable to update cart"),
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: number) => cartService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed");
    },
    onError: () => toast.error("Unable to remove item"),
  });

  const orderMutation = useMutation({
    mutationFn: () => orderService.create({ shippingAddress, paymentProvider }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order placed successfully");
      navigate("/orders");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Checkout failed");
        return;
      }

      toast.error("Checkout failed");
    },
  });

  if (isLoading) {
    return <main className="section-shell py-14 text-slate-500">Loading cart...</main>;
  }

  if (!cart?.items.length) {
    return (
      <main className="section-shell py-14">
        <EmptyState
          title="Your cart is currently empty"
          description="Add products from the catalog to begin checkout and order creation."
        />
      </main>
    );
  }

  return (
    <main className="section-shell py-14">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-ink">Shopping Cart</h1>
        <p className="mt-2 text-sm text-slate-500">Review your items and place your order.</p>
      </div>
      <div className="grid gap-8 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-5">
          {cart.items.map((item) => (
            <Card key={item.id} className="flex flex-col gap-5 rounded-[32px] p-5 sm:flex-row sm:items-center">
              <img src={item.product.imageUrl} alt={item.product.name} className="h-28 w-28 rounded-[24px] object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-brand-600">
                      {item.product.category.categoryName}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-ink">{item.product.name}</h2>
                  </div>
                  <p className="text-lg font-semibold text-brand-700">{formatCurrency(item.lineTotal)}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-full border border-white/70 bg-white/80 p-1">
                    <button
                      className="rounded-full p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                      onClick={() => updateItemMutation.mutate({ id: item.id, quantity: item.quantity - 1 })}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-3 text-sm font-semibold text-ink">{item.quantity}</span>
                    <button
                      className="rounded-full p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                      onClick={() => updateItemMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                      disabled={item.quantity >= item.product.inventory}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <Button variant="soft" onClick={() => removeItemMutation.mutate(item.id)}>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold text-ink">Shipping details</h2>
            <textarea
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
              rows={4}
              placeholder="Enter your full delivery address"
              className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
            />
            <select
              value={paymentProvider}
              onChange={(event) => setPaymentProvider(event.target.value as "RAZORPAY" | "COD")}
              className="form-select bg-white/85"
            >
              <option value="RAZORPAY">Razorpay</option>
              <option value="COD">Cash on Delivery</option>
            </select>
          </Card>
          <CartSummary
            subtotal={cart.summary.subtotal}
            onCheckout={() => orderMutation.mutate()}
            loading={orderMutation.isPending}
          />
        </div>
      </div>
    </main>
  );
};
