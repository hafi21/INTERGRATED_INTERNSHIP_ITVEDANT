import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Customer } from "../../types";
import { Button } from "../shared/button";
import { Card } from "../shared/card";

const customerSchema = z.object({
  fullName: z.string().min(3, "Customer name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Phone number must be 10 to 15 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password needs one uppercase letter")
    .regex(/[0-9]/, "Password needs one number")
    .optional()
    .or(z.literal("")),
  status: z.boolean().default(true),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

type AdminCustomerFormProps = {
  selectedCustomer: Customer | null;
  loading: boolean;
  onSubmit: (values: CustomerFormValues) => void;
  onReset: () => void;
};

export const AdminCustomerForm = ({
  selectedCustomer,
  loading,
  onSubmit,
  onReset,
}: AdminCustomerFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema.superRefine((values, ctx) => {
      if (!selectedCustomer && !values.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Temporary password is required for new customers",
        });
      }
    })),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      status: true,
    },
  });

  useEffect(() => {
    reset({
      fullName: selectedCustomer?.fullName ?? "",
      email: selectedCustomer?.email ?? "",
      phone: selectedCustomer?.phone ?? "",
      password: "",
      status: selectedCustomer?.status ?? true,
    });
  }, [reset, selectedCustomer]);

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Customer Module</p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">
            {selectedCustomer ? "Update customer" : "Add new customer"}
          </h3>
        </div>
        {selectedCustomer ? (
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              onReset();
              reset({
                fullName: "",
                email: "",
                phone: "",
                password: "",
                status: true,
              });
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            {...register("fullName")}
            placeholder="Customer name"
            className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
          />
          {errors.fullName ? <p className="mt-2 text-sm text-brand-700">{errors.fullName.message}</p> : null}
        </div>
        <div>
          <input
            {...register("email")}
            placeholder="Email address"
            className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
          />
          {errors.email ? <p className="mt-2 text-sm text-brand-700">{errors.email.message}</p> : null}
        </div>
        <div>
          <input
            {...register("phone")}
            placeholder="Phone number"
            className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
          />
          {errors.phone ? <p className="mt-2 text-sm text-brand-700">{errors.phone.message}</p> : null}
        </div>
        <div>
          <input
            {...register("password")}
            type="password"
            placeholder={selectedCustomer ? "Reset password (optional)" : "Temporary password"}
            className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
          />
          {errors.password ? <p className="mt-2 text-sm text-brand-700">{errors.password.message}</p> : null}
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-600">
          <input
            {...register("status")}
            type="checkbox"
            className="h-4 w-4 rounded border-brand-200 text-brand-600 focus:ring-brand-300"
          />
          Keep this customer account active
        </label>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : selectedCustomer ? "Update Customer" : "Create Customer"}
        </Button>
      </form>
    </Card>
  );
};
