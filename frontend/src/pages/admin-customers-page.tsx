import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { AdminCustomerForm, type CustomerFormValues } from "../components/customer/admin-customer-form";
import { CustomerManagementDashboard } from "../components/customer/customer-management-dashboard";
import { ConfirmModal } from "../components/shared/confirm-modal";
import { SectionHeading } from "../components/shared/section-heading";
import type { Customer } from "../types";
import { customerService } from "../services/customers";

export const AdminCustomersPage = () => {
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const { data: customers = [] } = useQuery({
    queryKey: ["customers", "admin"],
    queryFn: () => customerService.list(),
  });

  const getErrorMessage = (error: unknown, fallback: string) =>
    axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

  const stats = useMemo(() => {
    const active = customers.filter((customer) => customer.status).length;
    const inactive = customers.length - active;
    const totalOrders = customers.reduce((sum, customer) => sum + customer.orderCount, 0);

    return {
      total: customers.length,
      active,
      inactive,
      totalOrders,
    };
  }, [customers]);

  const saveMutation = useMutation({
    mutationFn: (values: CustomerFormValues) => {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        status: values.status,
        ...(values.password ? { password: values.password } : {}),
      };

      return selectedCustomer
        ? customerService.update(selectedCustomer.id, payload)
        : customerService.create({
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            password: values.password!,
          });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(selectedCustomer ? "Customer updated" : "Customer created");
      setSelectedCustomer(null);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Unable to save customer")),
  });

  const deleteMutation = useMutation({
    mutationFn: (customerId: number) => customerService.deactivate(customerId),
    onSuccess: (_data, customerId) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deactivated");
      setDeleteTarget(null);
      setSelectedCustomer((current) =>
        current && current.id === customerId ? null : current,
      );
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, "Unable to deactivate customer")),
  });

  return (
    <main className="section-shell py-14">
      <SectionHeading
        eyebrow="Customer Operations"
        title="Customer management"
        description="Create customer profiles, update account details, and control account access with safe deactivation."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Customers</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{stats.total}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">{stats.active}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Inactive</p>
          <p className="mt-3 text-3xl font-semibold text-slate-500">{stats.inactive}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Orders Logged</p>
          <p className="mt-3 text-3xl font-semibold text-brand-700">{stats.totalOrders}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.95fr,1.05fr]">
        <AdminCustomerForm
          selectedCustomer={selectedCustomer}
          onSubmit={(values) => saveMutation.mutate(values)}
          loading={saveMutation.isPending}
          onReset={() => setSelectedCustomer(null)}
        />
        <CustomerManagementDashboard
          customers={customers}
          onEdit={setSelectedCustomer}
          onDelete={setDeleteTarget}
        />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Deactivate customer account?"
        description="This action keeps the customer record and order history in the database, but it blocks login and marks the account as inactive."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        confirmLabel="Deactivate"
      />
    </main>
  );
};
