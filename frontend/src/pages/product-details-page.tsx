import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ShoppingCart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "../components/shared/button";
import { Card } from "../components/shared/card";
import { LoadingSkeleton } from "../components/shared/loading-skeleton";
import { formatCurrency } from "../lib/format";
import { useAuth } from "../hooks/use-auth";
import { cartService } from "../services/cart";
import { productService } from "../services/products";

export const ProductDetailsPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id),
  });

  const addToCartMutation = useMutation({
    mutationFn: () => cartService.add({ productId: Number(id), quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: () => toast.error("Could not add this product right now"),
  });

  if (isLoading) {
    return (
      <main className="section-shell py-14">
        <LoadingSkeleton className="h-[560px] w-full" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="section-shell py-14">
        <Card className="p-10 text-center">Product not found.</Card>
      </main>
    );
  }

  return (
    <main className="section-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
        <Card className="overflow-hidden p-0">
          <img src={product.imageUrl} alt={product.name} className="h-full min-h-[440px] w-full object-cover" />
        </Card>
        <Card className="rounded-[36px] p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">
              {product.category?.categoryName}
            </span>
            <span className="text-3xl font-semibold text-brand-700">{formatCurrency(product.price)}</span>
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink">{product.name}</h1>
          <p className="mt-5 text-base leading-8 text-slate-600">{product.description}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              `${product.inventory} in stock`,
              "Fast order placement",
              "Easy returns support",
              "Secure sign-in checkout",
            ].map((item) => (
              <div key={item} className="rounded-[24px] bg-white/80 p-4 text-sm text-slate-600">
                <span className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-600" />
                  {item}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              onClick={() => {
                if (!user) {
                  toast("Please login first");
                  navigate("/login");
                  return;
                }

                addToCartMutation.mutate();
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </Button>
            <Button variant="ghost" onClick={() => navigate("/products")}>
              Back to products
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
};
