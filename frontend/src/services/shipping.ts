import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export const shippingService = {
  getShipping: async (orderId: number) => {
    const response = await api.get(`/shipping/${orderId}`);
    return response.data;
  },

  trackShipment: async (orderId: number) => {
    const response = await api.get(`/shipping/track/${orderId}`);
    return response.data.tracking;
  },

  searchByTrackingNumber: async (trackingNumber: string) => {
    const response = await api.post(`/shipping/search-by-tracking`, { trackingNumber });
    return response.data.tracking;
  },

  createShipping: async (orderId: number) => {
    const response = await api.post(`/shipping/${orderId}`);
    return response.data;
  },

  updateShipping: async (id: number, data: { courierService?: string; trackingNumber?: string; shippingStatus?: string }) => {
    const response = await api.patch(`/shipping/${id}`, data);
    return response.data;
  },

  getAllShipping: async (status?: string) => {
    const url = status ? `/shipping?status=${status}` : `/shipping`;
    const response = await api.get(url);
    return response.data;
  },
};

export const useShipping = (orderId?: number) => {
  const queryClient = useQueryClient();

  const getShippingQuery = useQuery({
    queryKey: ["shipping", orderId],
    queryFn: async () => shippingService.getShipping(orderId!),
    enabled: !!orderId,
  });

  const trackShipmentQuery = useQuery({
    queryKey: ["shipment-tracking", orderId],
    queryFn: async () => shippingService.trackShipment(orderId!),
    enabled: !!orderId,
  });

  const createShippingMutation = useMutation({
    mutationFn: (orderId: number) => shippingService.createShipping(orderId),
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["shipping", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const updateShippingMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { courierService?: string; trackingNumber?: string; shippingStatus?: string } }) =>
      shippingService.updateShipping(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping"] });
      queryClient.invalidateQueries({ queryKey: ["shipment-tracking"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["all-shipping"] });
    },
  });

  const getAllShippingQuery = useQuery({
    queryKey: ["all-shipping"],
    queryFn: () => shippingService.getAllShipping(),
  });

  return {
    shipping: getShippingQuery.data,
    isLoadingShipping: getShippingQuery.isLoading,
    shippingError: getShippingQuery.error,

    tracking: trackShipmentQuery.data,
    isLoadingTracking: trackShipmentQuery.isLoading,
    trackingError: trackShipmentQuery.error,

    allShipping: getAllShippingQuery.data?.shipping,
    isLoadingAllShipping: getAllShippingQuery.isLoading,

    createShipping: createShippingMutation.mutate,
    isCreatingShipping: createShippingMutation.isPending,

    updateShipping: updateShippingMutation.mutate,
    isUpdatingShipping: updateShippingMutation.isPending,
  };
};
