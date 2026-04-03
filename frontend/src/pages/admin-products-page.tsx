import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { AdminProductForm, type ProductFormValues } from "../components/product/admin-product-form";
import { ProductManagementDashboard } from "../components/product/product-management-dashboard";
import { ConfirmModal } from "../components/shared/confirm-modal";
import { SectionHeading } from "../components/shared/section-heading";
import type { Product } from "../types";
import { categoryService } from "../services/categories";
import { productService } from "../services/products";

export const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "admin-products"],
    queryFn: () => categoryService.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products", "admin"],
    queryFn: () => productService.list({ includeInactive: true }),
  });

  const productStats = useMemo(() => {
    const activeCount = products.filter((product) => product.status === "ACTIVE").length;
    const inactiveCount = products.length - activeCount;

    return {
      total: products.length,
      active: activeCount,
      inactive: inactiveCount,
    };
  }, [products]);

  const getErrorMessage = (error: unknown, fallback: string) =>
    axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

  const saveMutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      selectedProduct
        ? productService.update(selectedProduct.id, values)
        : productService.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(selectedProduct ? "Product updated" : "Product created");
      setSelectedProduct(null);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Unable to save product")),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: number) => productService.deactivate(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deactivated");
      setDeleteTarget(null);
      setSelectedProduct((current) =>
        current && deleteTarget && current.id === deleteTarget.id
          ? null
          : current,
      );
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, "Unable to deactivate product")),
  });

  return (
    <main className="section-shell py-14">
      <SectionHeading
        eyebrow="Part 2 Submission Module"
        title="Admin product management with stock, pricing, and soft deactivation"
        description="This module now includes the full product workflow required for submission: admin-only creation, update, dashboard controls, category mapping, inventory count, SKU support, and a warning before deactivation."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Products</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{productStats.total}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active Products</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">{productStats.active}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Inactive Products</p>
          <p className="mt-3 text-3xl font-semibold text-slate-500">{productStats.inactive}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.95fr,1.05fr]">
        <AdminProductForm
          selectedProduct={selectedProduct}
          categories={categories}
          onSubmit={(values) => saveMutation.mutate(values)}
          loading={saveMutation.isPending}
          onReset={() => setSelectedProduct(null)}
        />
        <ProductManagementDashboard
          products={products}
          onEdit={setSelectedProduct}
          onDelete={setDeleteTarget}
        />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Deactivate product?"
        description="This action keeps the product record in the database, but it removes the item from active storefront listings and prevents new orders from being placed for it."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        confirmLabel="Deactivate"
      />
    </main>
  );
};
