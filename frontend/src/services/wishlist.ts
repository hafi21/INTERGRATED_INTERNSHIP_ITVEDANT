import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "./api";
import type { WishlistResponse } from "../types";

export const wishlistService = {
  async get() {
    const { data } = await api.get<WishlistResponse>("/wishlist");
    return data;
  },

  async add(productId: number) {
    const { data } = await api.post<WishlistResponse>("/wishlist", { productId });
    return data;
  },

  async remove(id: number) {
    const { data } = await api.delete<WishlistResponse>(`/wishlist/${id}`);
    return data;
  },

  async moveToCart(id: number) {
    const { data } = await api.patch<WishlistResponse>(`/wishlist/${id}/move-to-cart`, {});
    return data;
  },
};

export const useWishlist = () => {
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistService.get(),
    retry: 1,
  });

  const addMutation = useMutation({
    mutationFn: (productId: number) => wishlistService.add(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Added to wishlist");
    },
    onError: (error) => {
      toast.error("Failed to add to wishlist");
      console.error("Add to wishlist error:", error);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => wishlistService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
    onError: () => {
      toast.error("Failed to remove from wishlist");
    },
  });

  const moveToCartMutation = useMutation({
    mutationFn: (id: number) => wishlistService.moveToCart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Moved to cart");
    },
    onError: () => {
      toast.error("Failed to move to cart");
    },
  });

  return {
    wishlist,
    isLoading,
    addToWishlist: addMutation.mutate,
    removeFromWishlist: removeMutation.mutate,
    moveToCart: moveToCartMutation.mutate,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    isMoving: moveToCartMutation.isPending,
    removingItemId: removeMutation.isPending ? (removeMutation.variables ?? null) : null,
    movingItemId: moveToCartMutation.isPending ? (moveToCartMutation.variables ?? null) : null,
  };
};
