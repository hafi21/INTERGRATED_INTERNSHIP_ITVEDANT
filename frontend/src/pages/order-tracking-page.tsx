import { Loader2, Package, PackageCheck, Truck } from "lucide-react";
import { useParams } from "react-router-dom";
import { useShipping } from "../services/shipping";
import { Card } from "../components/shared/card";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Package className="h-6 w-6 text-blue-500" />;
    case "PROCESSING":
      return <Package className="h-6 w-6 text-yellow-500" />;
    case "SHIPPED":
      return <Truck className="h-6 w-6 text-purple-500" />;
    case "DELIVERED":
      return <PackageCheck className="h-6 w-6 text-green-500" />;
    case "CANCELLED":
      return <Package className="h-6 w-6 text-red-500" />;
    default:
      return <Package className="h-6 w-6 text-gray-500" />;
  }
};

const getStatusDescription = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Your order is being prepared for shipment";
    case "PROCESSING":
      return "Your order is being processed";
    case "SHIPPED":
      return "Your order is on its way";
    case "DELIVERED":
      return "Your order has been delivered";
    case "CANCELLED":
      return "This order has been cancelled";
    default:
      return "Unknown tracking status";
  }
};

export const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { tracking, isLoadingTracking } = useShipping(orderId ? Number(orderId) : undefined);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 px-4 py-12">
        <Card className="mx-auto max-w-2xl">
          <div className="p-8 text-center">
            <p className="text-slate-600">Order not found</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-ink">Track Your Order</h1>
              <p className="mt-2 text-slate-600">Order #{tracking?.order.orderNumber}</p>
            </div>

            {isLoadingTracking ? (
              <div className="mt-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            ) : tracking ? (
              <div className="mt-8 space-y-8">
                {/* Tracking Status */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(tracking.shippingStatus)}
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-ink">{tracking.shippingStatus}</h2>
                      <p className="text-sm text-slate-600">{getStatusDescription(tracking.shippingStatus)}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Courier Service</p>
                    <p className="mt-2 font-semibold text-ink">
                      {tracking.courierService || <span className="text-slate-400">Not yet assigned</span>}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Tracking Number</p>
                    <p className="mt-2 break-all font-semibold text-ink">
                      {tracking.trackingNumber || <span className="text-slate-400">Not yet assigned</span>}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Shipped Date</p>
                    <p className="mt-2 font-semibold text-ink">
                      {tracking.shippedAt
                        ? new Date(tracking.shippedAt).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : <span className="text-slate-400">Pending</span>}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Delivery Date</p>
                    <p className="mt-2 font-semibold text-ink">
                      {tracking.deliveredAt
                        ? new Date(tracking.deliveredAt).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : <span className="text-slate-400">Pending</span>}
                    </p>
                  </div>
                </div>

                {/* Order Info */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-semibold text-ink">Order Information</h3>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Customer</p>
                      <p className="mt-1 font-medium text-ink">{tracking.order.customer.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Email</p>
                      <p className="mt-1 font-medium text-ink">{tracking.order.customer.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-12 text-center">
                <p className="text-slate-600">No tracking information available</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
