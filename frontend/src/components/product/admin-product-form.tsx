import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category, Product } from "../../types";
import { Button } from "../shared/button";
import { Card } from "../shared/card";

const productSchema = z.object({
  name: z.string().min(3, "Product name is required"),
  sku: z
    .string()
    .trim()
    .min(3, "SKU is required")
    .max(40, "SKU must stay within 40 characters")
    .regex(/^[A-Z0-9-]+$/, "Use only uppercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description should be more descriptive").max(500),
  price: z.coerce.number().positive("Enter a valid price"),
  inventory: z.coerce.number().int().min(0, "Inventory cannot be negative"),
  imageUrl: z.string().url("Enter a valid image URL"),
  categoryId: z.coerce.number().int().positive("Choose a category"),
  featured: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

type AdminProductFormProps = {
  selectedProduct: Product | null;
  categories: Category[];
  loading: boolean;
  onSubmit: (values: ProductFormValues) => void;
  onReset: () => void;
};

export const AdminProductForm = ({
  selectedProduct,
  categories,
  loading,
  onSubmit,
  onReset,
}: AdminProductFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0,
      inventory: 0,
      imageUrl: "",
      categoryId: 0,
      featured: false,
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    reset({
      name: selectedProduct?.name ?? "",
      sku: selectedProduct?.sku ?? "",
      description: selectedProduct?.description ?? "",
      price: selectedProduct?.price ?? 0,
      inventory: selectedProduct?.inventory ?? 0,
      imageUrl: selectedProduct?.imageUrl ?? "",
      categoryId: selectedProduct?.categoryId ?? 0,
      featured: selectedProduct?.featured ?? false,
      status: selectedProduct?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    });
  }, [reset, selectedProduct]);

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Product Module</p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">
            {selectedProduct ? "Update product" : "Add new product"}
          </h3>
        </div>
        {selectedProduct ? (
          <Button variant="ghost" type="button" onClick={() => {
            onReset();
            reset({
              name: "",
              sku: "",
              description: "",
              price: 0,
              inventory: 0,
              imageUrl: "",
              categoryId: 0,
              featured: false,
              status: "ACTIVE",
            });
          }}>
            Clear
          </Button>
        ) : null}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <input
              {...register("name")}
              placeholder="Product name"
              className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
            />
            {errors.name ? <p className="mt-2 text-sm text-brand-700">{errors.name.message}</p> : null}
          </div>
          <div>
            <input
              {...register("sku")}
              placeholder="SKU (for example EE-001)"
              onChange={(event) => setValue("sku", event.target.value.toUpperCase(), { shouldValidate: true })}
              className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 uppercase outline-none focus:border-brand-300"
            />
            {errors.sku ? <p className="mt-2 text-sm text-brand-700">{errors.sku.message}</p> : null}
          </div>
        </div>

        <div>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="Product description"
            className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
          />
          {errors.description ? (
            <p className="mt-2 text-sm text-brand-700">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <input
              {...register("price")}
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
            />
            {errors.price ? <p className="mt-2 text-sm text-brand-700">{errors.price.message}</p> : null}
          </div>
          <div>
            <input
              {...register("inventory")}
              type="number"
              min="0"
              step="1"
              placeholder="Inventory count"
              className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
            />
            {errors.inventory ? (
              <p className="mt-2 text-sm text-brand-700">{errors.inventory.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <input
            {...register("imageUrl")}
            placeholder="Product image URL"
            className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
          />
          {errors.imageUrl ? (
            <p className="mt-2 text-sm text-brand-700">{errors.imageUrl.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <select
              {...register("categoryId")}
              className="form-select w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
            >
              <option value={0}>Select category</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
            {errors.categoryId ? (
              <p className="mt-2 text-sm text-brand-700">{errors.categoryId.message}</p>
            ) : null}
          </div>
          <div>
            <select
              {...register("status")}
              className="form-select w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            {errors.status ? <p className="mt-2 text-sm text-brand-700">{errors.status.message}</p> : null}
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-600">
          <input
            {...register("featured")}
            type="checkbox"
            className="h-4 w-4 rounded border-brand-200 text-brand-600 focus:ring-brand-300"
          />
          Feature this product on the home page
        </label>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : selectedProduct ? "Update Product" : "Create Product"}
        </Button>
      </form>
    </Card>
  );
};
