import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, AlertCircle, Package, PackageCheck, Truck } from "lucide-react";
import { api } from "../services/api";
import { Card } from "../components/shared/card";
import { Button } from "../components/shared/button";
import { formatCurrency } from "../lib/format";

type TrackingResult = {
  id: number;
  orderId: number;
  order: {
    id: number;
    orderNumber: string;
    customer: {
      fullName: string;
      email: string;
    };
  };
  courierService: string | null;
  trackingNumber: string | null;
  shippingStatus: string;
  shippingCost: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
};

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

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-blue-100 text-blue-700";
    case "PROCESSING":
      return "bg-yellow-100 text-yellow-700";
    case "SHIPPED":
      return "bg-purple-100 text-purple-700";
    case "DELIVERED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const TrackShipmentPage = () => {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/shipping/search-by-tracking", {
        trackingNumber: trackingNumber.trim(),
      });
      setResult(response.data.tracking);
    } catch (err: any) {
      setError(err.response?.data?.message || "Shipment not found. Please check your tracking number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-ink">Track Your Shipment</h1>
          <p className="mt-3 text-lg text-slate-600">
            Enter your tracking number to see the current status of your order
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-8 p-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="tracking" className="block text-sm font-medium text-ink">
                Tracking Number
              </label>
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="tracking"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter your tracking number..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <div className="p-8 space-y-8">
              {/* Status Header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-ink">Order #{result.order.orderNumber}</h2>
              </div>

              {/* Tracking Status */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="flex items-center gap-4">
                  {getStatusIcon(result.shippingStatus)}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-ink">{result.shippingStatus}</h3>
                    <p className="text-sm text-slate-600">{getStatusDescription(result.shippingStatus)}</p>
                  </div>
                </div>
              </div>

              {/* Tracking Details Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Tracking Number</p>
                  <p className="mt-2 break-all font-semibold text-ink">
                    {result.trackingNumber || <span className="text-slate-400">Not yet assigned</span>}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Courier Service</p>
                  <p className="mt-2 font-semibold text-ink">
                    {result.courierService || <span className="text-slate-400">Not yet assigned</span>}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Shipped Date</p>
                  <p className="mt-2 font-semibold text-ink">
                    {result.shippedAt
                      ? new Date(result.shippedAt).toLocaleDateString("en-US", {
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
                    {result.deliveredAt
                      ? new Date(result.deliveredAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : <span className="text-slate-400">Pending</span>}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Shipping Cost</p>
                  <p className="mt-2 font-semibold text-ink">{formatCurrency(Number(result.shippingCost))}</p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Status Badge</p>
                  <p className="mt-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(result.shippingStatus)}`}>
                      {result.shippingStatus}
                    </span>
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-ink">Order Information</h3>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Customer</p>
                    <p className="mt-1 font-medium text-ink">{result.order.customer.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Email</p>
                    <p className="mt-1 font-medium text-ink">{result.order.customer.email}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-200 pt-6">
                <Button
                  onClick={() => navigate(`/orders/${result.orderId}/track`)}
                  variant="soft"
                  className="w-full"
                >
                  View Full Order Details
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <Card className="p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-slate-300" />
            <p className="mt-4 text-slate-500">Search for your tracking number to get started</p>
          </Card>
        )}
      </div>
    </div>
  );
};
