import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { OrderCard } from "../components/orders/order-card";
import { EmptyState } from "../components/shared/empty-state";
import { SectionHeading } from "../components/shared/section-heading";
import { useAuth } from "../hooks/use-auth";
import { loadRazorpayScript, openRazorpayCheckout } from "../lib/razorpay";
import type { Order } from "../types";
import { orderService } from "../services/orders";
import { paymentService } from "../services/payments";

export const OrdersPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.list(),
  });

  const handlePay = async (order: Order) => {
    setActiveOrderId(order.id);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout");
      }

      const payload = await paymentService.createRazorpayOrder(order.id);
      const response = await openRazorpayCheckout({
        key: payload.keyId,
        amount: payload.checkout.amount,
        currency: payload.checkout.currency,
        razorpayOrderId: payload.checkout.razorpayOrderId,
        orderNumber: order.orderNumber,
        customerName: user?.fullName,
        customerEmail: user?.email,
      });

      await paymentService.verifyRazorpayPayment({
        orderId: order.id,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });

      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Payment completed successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Payment could not be completed";
      toast.error(message);
    } finally {
      setActiveOrderId(null);
    }
  };

  return (
    <main className="section-shell py-14">
      <SectionHeading
        eyebrow="Orders"
        title="Your orders"
        description="Track recent purchases and complete payment for pending orders."
      />
      <div className="mt-10 space-y-6">
        {isLoading ? (
          <div className="text-slate-500">Loading orders...</div>
        ) : orders.length ? (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPay={() => void handlePay(order)}
              loading={activeOrderId === order.id}
            />
          ))
        ) : (
          <EmptyState
            title="No orders yet"
            description="Place an order from the cart page to populate this dashboard and test the payment flow."
          />
        )}
      </div>
    </main>
  );
};
