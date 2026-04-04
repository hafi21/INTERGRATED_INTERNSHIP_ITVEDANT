import { useState, useEffect } from "react";
import { AlertCircle, Edit2, Loader2, Truck, X } from "lucide-react";
import toast from "react-hot-toast";
import { useShipping } from "../../services/shipping";
import { Button } from "../shared/button";
import { Modal } from "../shared/modal";

type ShippingInfoModalProps = {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
};

export const ShippingInfoModal = ({ orderId, isOpen, onClose }: ShippingInfoModalProps) => {
  const { shipping, isLoadingShipping, updateShipping, isUpdatingShipping } = useShipping(orderId);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    courierService: "",
    trackingNumber: "",
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleEdit = () => {
    if (shipping) {
      setFormData({
        courierService: shipping.courierService || "",
        trackingNumber: shipping.trackingNumber || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (shipping) {
      setUpdateSuccess(true);
      updateShipping({
        id: shipping.id,
        data: {
          courierService: formData.courierService || undefined,
          trackingNumber: formData.trackingNumber || undefined,
        },
      });
    }
  };

  // Close modal and show success when update completes
  useEffect(() => {
    if (updateSuccess && !isUpdatingShipping && isEditing) {
      setIsEditing(false);
      setUpdateSuccess(false);
      toast.success("Shipping details updated!");
    }
  }, [isUpdatingShipping, updateSuccess, isEditing]);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="pointer-events-auto w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-ink">Shipping Details</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoadingShipping ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            </div>
          ) : !shipping ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="mb-3 h-8 w-8 text-slate-400" />
              <p className="text-center text-sm text-slate-600">No shipping information yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-brand-600" />
                    <span className="text-sm font-medium text-slate-600">Shipping Status</span>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(shipping.shippingStatus)}`}>
                    {shipping.shippingStatus}
                  </span>
                </div>
              </div>

              {!isEditing ? (
                <>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-slate-500">Courier Service</label>
                    <p className="mt-1 text-sm font-medium text-ink">
                      {shipping.courierService || <span className="text-slate-400">Not specified</span>}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-slate-500">Tracking Number</label>
                    <p className="mt-1 text-sm font-medium text-ink">
                      {shipping.trackingNumber || <span className="text-slate-400">Not specified</span>}
                    </p>
                  </div>

                  <div className="grid gap-2 pt-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-slate-500">Shipped At</label>
                      <p className="mt-1 text-sm font-medium text-ink">
                        {shipping.shippedAt
                          ? new Date(shipping.shippedAt).toLocaleDateString()
                          : <span className="text-slate-400">Pending</span>}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-slate-500">Delivered At</label>
                      <p className="mt-1 text-sm font-medium text-ink">
                        {shipping.deliveredAt
                          ? new Date(shipping.deliveredAt).toLocaleDateString()
                          : <span className="text-slate-400">Pending</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleEdit} variant="ghost" className="flex-1">
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button onClick={onClose} variant="soft" className="flex-1">
                      Close
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500">Courier Service</label>
                    <input
                      type="text"
                      value={formData.courierService}
                      onChange={(e) => setFormData({ ...formData, courierService: e.target.value })}
                      placeholder="e.g., FedEx, DHL, UPS"
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500">Tracking Number</label>
                    <input
                      type="text"
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                      placeholder="Enter tracking number"
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isUpdatingShipping}
                      className="flex-1"
                    >
                      {isUpdatingShipping ? "Saving..." : "Save"}
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="ghost" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
