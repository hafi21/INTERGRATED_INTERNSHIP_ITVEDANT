import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CategoryDashboard } from "../components/category/category-dashboard";
import { CategoryForm } from "../components/category/category-form";
import { ConfirmModal } from "../components/shared/confirm-modal";
import { SectionHeading } from "../components/shared/section-heading";
import type { Category } from "../types";
import { categoryService } from "../services/categories";

export const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "admin"],
    queryFn: () => categoryService.list(true),
  });

  const saveMutation = useMutation({
    mutationFn: (values: { categoryName: string; description?: string }) =>
      selectedCategory
        ? categoryService.update(selectedCategory.categoryId, values)
        : categoryService.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(selectedCategory ? "Category updated" : "Category created");
      setSelectedCategory(null);
    },
    onError: () => toast.error("Unable to save category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: number) => categoryService.deactivate(categoryId),
    onSuccess: (_data, categoryId) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deactivated");
      setDeleteTarget(null);
      setSelectedCategory((current) =>
        current && current.categoryId === categoryId ? null : current,
      );
    },
    onError: () => toast.error("Unable to deactivate category"),
  });

  return (
    <main className="section-shell py-14">
      <SectionHeading
        eyebrow="Catalog Control"
        title="Category management"
        description="Create, update, and deactivate product categories while keeping storefront organization clean and consistent."
      />
      <div className="mt-10 grid gap-8 xl:grid-cols-[0.95fr,1.05fr]">
        <CategoryForm
          selectedCategory={selectedCategory}
          onSubmit={(values) => saveMutation.mutate(values)}
          loading={saveMutation.isPending}
        />
        <CategoryDashboard
          categories={categories}
          onEdit={setSelectedCategory}
          onDelete={setDeleteTarget}
        />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Deactivate category?"
        description="This action uses soft delete and keeps the record in the database, but the category will stop appearing in active storefront listings."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.categoryId)}
        confirmLabel="Deactivate"
      />
    </main>
  );
};
