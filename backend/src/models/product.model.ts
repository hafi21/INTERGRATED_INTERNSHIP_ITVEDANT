import { decimalToNumber } from "../utils/serializers.js";

type ProductEntity = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: unknown;
  inventory: number;
  imageUrl: string;
  status: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId: number;
  category?: {
    categoryId: number;
    categoryName: string;
  };
};

export const serializeProduct = (product: ProductEntity) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  sku: product.sku,
  description: product.description,
  price: decimalToNumber(product.price as number),
  inventory: product.inventory,
  imageUrl: product.imageUrl,
  status: product.status,
  featured: product.featured,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  categoryId: product.categoryId,
  category: product.category,
});
