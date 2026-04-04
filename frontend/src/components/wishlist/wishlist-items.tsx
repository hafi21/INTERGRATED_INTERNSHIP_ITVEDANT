import { Trash2, ShoppingCart } from "lucide-react";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import { EmptyState } from "../shared/empty-state";
import { formatCurrency } from "../../lib/format";
import type { WishlistResponse } from "../../types";

type WishlistItemsProps = {
  wishlist?: WishlistResponse;
  isLoading: boolean;
  removeFromWishlist: (id: number) => void;
  moveToCart: (id: number) => void;
  removingItemId: number | null;
  movingItemId: number | null;
};

export const WishlistItems = ({
  wishlist,
  isLoading,
  removeFromWishlist,
  moveToCart,
  removingItemId,
  movingItemId,
}: WishlistItemsProps) => {
  if (isLoading) {
    return <div className="text-slate-500">Loading wishlist...</div>;
  }

  if (!wishlist?.items.length) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Add products from the catalog to save them for later."
      />
    );
  }

  return (
    <div className="space-y-4">
      {wishlist.items.map((item) => (
        <Card key={item.id} className="flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4 flex-1">
            <img
              src={item.product.imageUrl}
              alt={item.product.name}
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-600">
                {item.product.category?.categoryName ?? "Collection"}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-ink">{item.product.name}</h3>
              <p className="mt-2 text-lg font-semibold text-brand-700">
                {formatCurrency(item.product.price)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {item.product.isAvailable ? (
                  <span className="text-emerald-600">In Stock</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="soft"
              onClick={() => moveToCart(item.id)}
              disabled={!item.product.isAvailable || movingItemId === item.id || removingItemId === item.id}
              className="w-full sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4" />
              {movingItemId === item.id ? "Moving..." : "Move to Cart"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => removeFromWishlist(item.id)}
              disabled={movingItemId === item.id || removingItemId === item.id}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              {removingItemId === item.id ? "Removing..." : "Remove"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
