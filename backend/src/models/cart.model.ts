import { decimalToNumber, roundCurrency } from "../utils/serializers.js";

type CartItemEntity = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    imageUrl: string;
    price: unknown;
    inventory: number;
    category: {
      categoryId: number;
      categoryName: string;
    };
  };
};

export const serializeCart = (items: CartItemEntity[]) => {
  const mappedItems = items.map((item) => {
    const unitPrice = decimalToNumber(item.product.price as number);
    const lineTotal = roundCurrency(unitPrice * item.quantity);

    return {
      id: item.id,
      quantity: item.quantity,
      lineTotal,
      product: {
        id: item.product.id,
        name: item.product.name,
        imageUrl: item.product.imageUrl,
        price: unitPrice,
        inventory: item.product.inventory,
        category: item.product.category,
      },
    };
  });

  const subtotal = roundCurrency(
    mappedItems.reduce((sum, item) => sum + item.lineTotal, 0),
  );

  return {
    items: mappedItems,
    summary: {
      itemCount: mappedItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
    },
  };
};

