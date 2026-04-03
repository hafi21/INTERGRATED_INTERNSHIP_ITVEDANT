import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "../../types";
import { formatCurrency } from "../../lib/format";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import { EmptyState } from "../shared/empty-state";

type ProductManagementDashboardProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export const ProductManagementDashboard = ({
  products,
  onEdit,
  onDelete,
}: ProductManagementDashboardProps) => (
  <Card className="overflow-hidden p-0">
    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Product Management</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">Dashboard</h3>
      </div>
      <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
        {products.length} products
      </span>
    </div>

    {products.length ? (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/80 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">SKU</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-slate-100 align-top">
                <td className="px-6 py-4">
                  <div className="flex min-w-[280px] items-center gap-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                    <div>
                      <p className="font-medium text-ink">{product.name}</p>
                      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-600">{product.sku}</td>
                <td className="px-6 py-4 text-slate-600">
                  {product.category?.categoryName ?? "Unassigned"}
                </td>
                <td className="px-6 py-4 font-medium text-ink">{formatCurrency(product.price)}</td>
                <td className="px-6 py-4 text-slate-600">{product.inventory}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                        product.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {product.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                    {product.featured ? (
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
                        Featured
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => onEdit(product)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="soft"
                      onClick={() => onDelete(product)}
                      disabled={product.status !== "ACTIVE"}
                    >
                      <Trash2 className="h-4 w-4" />
                      Deactivate
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="p-6">
        <EmptyState
          title="No products added yet"
          description="Create your first catalog item here so the product dashboard is ready for submission and storefront browsing."
        />
      </div>
    )}
  </Card>
);
