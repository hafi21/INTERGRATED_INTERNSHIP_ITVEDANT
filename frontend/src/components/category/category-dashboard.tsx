import { Pencil, Trash2 } from "lucide-react";
import type { Category } from "../../types";
import { Button } from "../shared/button";
import { Card } from "../shared/card";

export const CategoryDashboard = ({
  categories,
  onEdit,
  onDelete,
}: {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) => (
  <Card className="overflow-hidden p-0">
    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Category Management</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">Dashboard</h3>
      </div>
      <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
        {categories.length} categories
      </span>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-white/80 text-slate-500">
          <tr>
            <th className="px-6 py-4 font-medium">Category</th>
            <th className="px-6 py-4 font-medium">Description</th>
            <th className="px-6 py-4 font-medium">Products</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.categoryId} className="border-t border-slate-100">
              <td className="px-6 py-4 font-medium text-ink">{category.categoryName}</td>
              <td className="max-w-md px-6 py-4 text-slate-600">{category.description}</td>
              <td className="px-6 py-4 text-slate-600">{category.productCount}</td>
              <td className="px-6 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                    category.status
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {category.status ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => onEdit(category)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="soft" onClick={() => onDelete(category)}>
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
  </Card>
);
