import { useMemo } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatedCounter } from "../components/shared/animated-counter";
import { Button } from "../components/shared/button";
import { Card } from "../components/shared/card";
import { SectionHeading } from "../components/shared/section-heading";
import { ProductCard } from "../components/product/product-card";
import { useAuth } from "../hooks/use-auth";
import { cartService } from "../services/cart";
import { categoryService } from "../services/categories";
import { productService } from "../services/products";

export const HomePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "home"],
    queryFn: () => categoryService.list(),
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productService.list({ featured: true }),
  });

  const stats = useMemo(
    () => [
      { label: "Categories", value: categories.length || 3 },
      { label: "Featured products", value: products.length || 6 },
      { label: "Fast checkout", value: 24 },
    ],
    [categories.length, products.length],
  );

  const addToCartMutation = useMutation({
    mutationFn: (productId: number) => cartService.add({ productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item added to cart");
    },
    onError: () => toast.error("Unable to add item right now"),
  });

  const handleAddToCart = (productId: number) => {
    if (!user) {
      toast("Sign in to add items to your cart");
      navigate("/login");
      return;
    }

    addToCartMutation.mutate(productId);
  };

  return (
    <main>
      <section className="section-shell pb-14 pt-12">
        <div className="grid gap-8 lg:grid-cols-[1.12fr,0.88fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-panel rounded-[40px] p-8 sm:p-12"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
              <Sparkles className="h-4 w-4" />
              New season picks
            </div>
            <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
              Shop everyday essentials with a clean, fast storefront.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Browse office gear, tech accessories, and desk setup products in one place. Add to cart, place orders, and come back anytime to track them.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products">
                <Button>
                  Shop now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {user?.role === "ADMIN" ? (
                <Link to="/admin/categories">
                  <Button variant="ghost">Manage categories</Button>
                </Link>
              ) : null}
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="rounded-[24px] bg-white/70 p-5">
                  <p className="text-3xl font-semibold text-ink">
                    <AnimatedCounter value={stat.value} suffix={stat.label === "Fast checkout" ? "h" : "+"} />
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="relative overflow-hidden rounded-[40px] border border-white/60 shadow-glow"
          >
            <img
              src="https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=1200&q=80"
              alt="Workspace products"
              className="h-full min-h-[520px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 z-10 p-8 text-white">
              <p className="text-sm uppercase tracking-[0.28em] text-white/75">Trending this week</p>
              <h2 className="mt-4 max-w-md text-3xl font-semibold">Clean desk upgrades for work, study, and daily carry.</h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  "Free shipping over INR 500",
                  "Online product images included",
                  "Simple cart and order flow",
                ].map((item) => (
                  <div key={item} className="rounded-[24px] border border-white/20 bg-white/12 p-4 text-sm backdrop-blur">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-shell py-10">
        <SectionHeading
          eyebrow="Shop By Category"
          title="Browse by collection"
          description="Pick a category and explore products that match what you need."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.categoryId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <Card className="h-full rounded-[28px]">
                <p className="text-sm uppercase tracking-[0.22em] text-brand-600">Category</p>
                <h3 className="mt-3 text-2xl font-semibold text-ink">{category.categoryName}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
                <div className="mt-6 inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
                  {category.productCount} products
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-shell py-12">
        <SectionHeading
          eyebrow="Featured Products"
          title="Best sellers and customer favorites"
          description="Popular picks you can add to cart right away."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </section>
    </main>
  );
};
