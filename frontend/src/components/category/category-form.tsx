import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "../../types";
import { Button } from "../shared/button";
import { Card } from "../shared/card";

const categorySchema = z.object({
  categoryName: z.string().min(2, "Category name is required"),
  description: z.string().max(300, "Description must stay within 300 characters").optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export const CategoryForm = ({
  selectedCategory,
  onSubmit,
  loading,
}: {
  selectedCategory: Category | null;
  onSubmit: (values: CategoryFormValues) => void;
  loading: boolean;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: "",
      description: "",
    },
  });

  useEffect(() => {
    reset({
      categoryName: selectedCategory?.categoryName ?? "",
      description: selectedCategory?.description ?? "",
    });
  }, [reset, selectedCategory]);

  return (
    <Card className="space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Admin Module</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">
          {selectedCategory ? "Update category" : "Create category"}
        </h3>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            {...register("categoryName")}
            placeholder="Category name"
            className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
          />
          {errors.categoryName ? (
            <p className="mt-2 text-sm text-brand-700">{errors.categoryName.message}</p>
          ) : null}
        </div>
        <div>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="Short category description"
            className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
          />
          {errors.description ? (
            <p className="mt-2 text-sm text-brand-700">{errors.description.message}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : selectedCategory ? "Update Category" : "Create Category"}
        </Button>
      </form>
    </Card>
  );
};

