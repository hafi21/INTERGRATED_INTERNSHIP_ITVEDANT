import { decimalToNumber } from "../utils/serializers.js";

type WishlistItemEntity = {
  id: number;
  createdAt: Date;
  product: {
    id: number;
    name: string;
    imageUrl: string;
    price: unknown;
    inventory: number;
    status: string;
    category: {
      categoryId: number;
      categoryName: string;
    };
  };
};

export const serializeWishlist = (items: WishlistItemEntity[]) => {
  const mappedItems = items.map((item) => {
    const price = decimalToNumber(item.product.price as number);
    const isAvailable = item.product.inventory > 0 && item.product.status === "ACTIVE";

    return {
      id: item.id,
      createdAt: item.createdAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        imageUrl: item.product.imageUrl,
        price,
        inventory: item.product.inventory,
        isAvailable,
        category: item.product.category,
      },
    };
  });

  return {
    items: mappedItems,
    summary: {
      itemCount: mappedItems.length,
      availableCount: mappedItems.filter((item) => item.product.isAvailable).length,
    },
  };
};
