import { Heart } from "lucide-react";
import { WishlistItems } from "../components/wishlist/wishlist-items";
import { useWishlist } from "../services/wishlist";

export const WishlistPage = () => {
  const {
    wishlist,
    isLoading,
    removeFromWishlist,
    moveToCart,
    removingItemId,
    movingItemId,
  } = useWishlist();

  return (
    <main className="section-shell py-14">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-brand-600" fill="currentColor" />
          <h1 className="text-4xl font-semibold text-ink">My Wishlist</h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Save products for later and manage your favorites.
        </p>
      </div>

      {isLoading ? (
        <div className="text-slate-500">Loading your wishlist...</div>
      ) : (
        <div className="max-w-4xl">
          <div className="mb-6 rounded-lg bg-brand-50 px-4 py-3">
            <p className="text-sm font-medium text-brand-700">
              {wishlist?.summary.itemCount ?? 0} items in wishlist
              {wishlist?.summary.availableCount && (
                <span className="ml-2 text-slate-600">
                  ({wishlist.summary.availableCount} available)
                </span>
              )}
            </p>
          </div>
          <WishlistItems
            wishlist={wishlist}
            isLoading={isLoading}
            removeFromWishlist={removeFromWishlist}
            moveToCart={moveToCart}
            removingItemId={removingItemId}
            movingItemId={movingItemId}
          />
        </div>
      )}
    </main>
  );
};
