import { decimalToNumber } from "../utils/serializers.js";

type PaymentEntity = {
  id: number;
  provider: string;
  paymentMethod: string | null;
  transactionRef: string;
  refundReference: string | null;
  amount: unknown;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  refundedAt: Date | null;
  order: {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: unknown;
    createdAt: Date;
    user: {
      id: number;
      fullName: string;
      email: string;
    };
  };
};

export const serializePayment = (payment: PaymentEntity) => ({
  id: payment.id,
  provider: payment.provider,
  paymentMethod: payment.paymentMethod,
  transactionRef: payment.transactionRef,
  refundReference: payment.refundReference,
  amount: decimalToNumber(payment.amount as number),
  status: payment.status,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
  refundedAt: payment.refundedAt,
  order: {
    id: payment.order.id,
    orderNumber: payment.order.orderNumber,
    status: payment.order.status,
    totalAmount: decimalToNumber(payment.order.totalAmount as number),
    createdAt: payment.order.createdAt,
    customer: {
      id: payment.order.user.id,
      fullName: payment.order.user.fullName,
      email: payment.order.user.email,
    },
  },
});
