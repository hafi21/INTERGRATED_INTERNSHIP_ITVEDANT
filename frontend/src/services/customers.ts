import { api } from "./api";
import type { Customer } from "../types";

export type CustomerPayload = {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  status?: boolean;
};

export const customerService = {
  async list() {
    const { data } = await api.get<{ customers: Customer[] }>("/customers");
    return data.customers;
  },
  async create(payload: Required<Pick<CustomerPayload, "fullName" | "email" | "phone" | "password">>) {
    const { data } = await api.post<{ customer: Customer }>("/customers", payload);
    return data.customer;
  },
  async update(id: number, payload: CustomerPayload) {
    const { data } = await api.put<{ customer: Customer }>(`/customers/${id}`, payload);
    return data.customer;
  },
  async deactivate(id: number) {
    const { data } = await api.delete<{ customer: Customer }>(`/customers/${id}`);
    return data.customer;
  },
};
