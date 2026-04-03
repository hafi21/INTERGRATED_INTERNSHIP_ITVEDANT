import { decimalToNumber } from "../utils/serializers.js";

type CustomerEntity = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  orders?: Array<{
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: unknown;
    createdAt: Date;
  }>;
  _count?: {
    orders: number;
  };
};

export const serializeCustomer = (customer: CustomerEntity) => ({
  id: customer.id,
  fullName: customer.fullName,
  email: customer.email,
  phone: customer.phone,
  role: customer.role,
  status: customer.status,
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt,
  orderCount: customer._count?.orders ?? customer.orders?.length ?? 0,
  orderHistory:
    customer.orders?.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: decimalToNumber(order.totalAmount as number),
      createdAt: order.createdAt,
    })) ?? [],
});
