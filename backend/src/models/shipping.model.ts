import { decimalToNumber } from "../utils/serializers.js";

type ShippingEntity = {
  id: number;
  courierService: string | null;
  trackingNumber: string | null;
  shippingStatus: string;
  shippingCost: unknown;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  order: {
    id: number;
    orderNumber: string;
    user: {
      id: number;
      fullName: string;
      email: string;
    };
  };
};

export const serializeShipping = (shipping: ShippingEntity) => {
  return {
    id: shipping.id,
    courierService: shipping.courierService,
    trackingNumber: shipping.trackingNumber,
    shippingStatus: shipping.shippingStatus,
    shippingCost: decimalToNumber(shipping.shippingCost as number),
    shippedAt: shipping.shippedAt,
    deliveredAt: shipping.deliveredAt,
    createdAt: shipping.createdAt,
    updatedAt: shipping.updatedAt,
    order: {
      id: shipping.order.id,
      orderNumber: shipping.order.orderNumber,
      customer: {
        id: shipping.order.user.id,
        fullName: shipping.order.user.fullName,
        email: shipping.order.user.email,
      },
    },
  };
};
