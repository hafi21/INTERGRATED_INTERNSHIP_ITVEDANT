import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import type { Product } from "../../types";
import { formatCurrency } from "../../lib/format";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import { useWishlist } from "../../services/wishlist";

export const ProductCard = ({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (productId: number) => void;
}) => {
  const { wishlist, addToWishlist, removeFromWishlist, isAdding, isRemoving } = useWishlist();
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const inWishlist = wishlist?.items.some((item) => item.product.id === product.id);
    setIsInWishlist(inWishlist ?? false);
  }, [wishlist, product.id]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist) {
      const wishlistItem = wishlist?.items.find((item) => item.product.id === product.id);
      if (wishlistItem) {
        removeFromWishlist(wishlistItem.id);
      }
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45 }}
    >
      <Card className="group overflow-hidden p-0">
        <div className="relative overflow-hidden rounded-[28px]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <button
            onClick={handleWishlistToggle}
            disabled={isAdding || isRemoving}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 transition hover:bg-white disabled:opacity-50"
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-5 w-5 transition ${
                isInWishlist ? "fill-brand-700 text-brand-700" : "text-slate-600"
              }`}
            />
          </button>
          {product.featured ? (
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">
              Featured
            </span>
          ) : null}
      </div>
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">
            {product.category?.categoryName ?? "Collection"}
          </span>
          <span className="text-lg font-semibold text-brand-700">{formatCurrency(product.price)}</span>
        </div>
        <Link to={`/products/${product.id}`}>
          <h3 className="text-xl font-semibold text-ink transition group-hover:text-brand-700">
            {product.name}
          </h3>
        </Link>
        <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>
        <div className="mt-6 flex gap-3">
          <Link to={`/products/${product.id}`} className="flex-1">
            <Button variant="ghost" className="w-full">
              View details
            </Button>
          </Link>
          <Button className="flex-1" onClick={() => onAddToCart(product.id)}>
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  </motion.div>
);
};
