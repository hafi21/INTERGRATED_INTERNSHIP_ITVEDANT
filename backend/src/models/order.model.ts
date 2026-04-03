import { decimalToNumber } from "../utils/serializers.js";

type OrderEntity = {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: unknown;
  shippingFee: unknown;
  totalAmount: unknown;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
  orderItems: Array<{
    id: number;
    quantity: number;
    unitPrice: unknown;
    lineTotal: unknown;
    product: {
      id: number;
      name: string;
      imageUrl: string;
    };
  }>;
  payment?: {
    id: number;
    provider: string;
    transactionRef: string;
    amount: unknown;
    status: string;
    createdAt: Date;
  } | null;
};

export const serializeOrder = (order: OrderEntity) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  status: order.status,
  subtotal: decimalToNumber(order.subtotal as number),
  shippingFee: decimalToNumber(order.shippingFee as number),
  totalAmount: decimalToNumber(order.totalAmount as number),
  shippingAddress: order.shippingAddress,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  userId: order.userId,
  customer: order.user
    ? {
        id: order.user.id,
        fullName: order.user.fullName,
        email: order.user.email,
      }
    : null,
  items: order.orderItems.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    unitPrice: decimalToNumber(item.unitPrice as number),
    lineTotal: decimalToNumber(item.lineTotal as number),
    product: item.product,
  })),
  payment: order.payment
    ? {
        ...order.payment,
        amount: decimalToNumber(order.payment.amount as number),
      }
    : null,
});
