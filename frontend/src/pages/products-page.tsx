import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ProductFilters } from "../components/product/product-filters";
import { ProductCard } from "../components/product/product-card";
import { EmptyState } from "../components/shared/empty-state";
import { LoadingSkeleton } from "../components/shared/loading-skeleton";
import { SectionHeading } from "../components/shared/section-heading";
import { useAuth } from "../hooks/use-auth";
import { cartService } from "../services/cart";
import { categoryService } from "../services/categories";
import { productService } from "../services/products";

export const ProductsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "products-page"],
    queryFn: () => categoryService.list(),
  });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", search, categoryId],
    queryFn: () =>
      productService.list({
        search: search || undefined,
        categoryId: categoryId ?? undefined,
      }),
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: number) => cartService.add({ productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item added to cart");
    },
    onError: () => toast.error("Unable to add item right now"),
  });

  const productResults = useMemo(() => products, [products]);

  const handleAddToCart = (productId: number) => {
    if (!user) {
      toast("Please login to continue");
      navigate("/login");
      return;
    }

    addToCartMutation.mutate(productId);
  };

  return (
    <main className="section-shell py-14">
      <SectionHeading
        eyebrow="All Products"
        title="Shop the full collection"
        description="Search products, filter by category, and add what you need to cart."
      />
      <div className="mt-8">
        <ProductFilters
          search={search}
          categoryId={categoryId}
          categories={categories}
          onSearchChange={setSearch}
          onCategoryChange={setCategoryId}
        />
      </div>

      {isLoading ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-[420px] w-full" />
          ))}
        </div>
      ) : productResults.length ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {productResults.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="No products match this view"
            description="Adjust your search or pick a different category to continue exploring the catalog."
          />
        </div>
      )}
    </main>
  );
};
