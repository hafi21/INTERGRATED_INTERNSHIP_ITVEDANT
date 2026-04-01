type CategoryEntity = {
  categoryId: number;
  categoryName: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: boolean;
  _count?: {
    products: number;
  };
};

export const serializeCategory = (category: CategoryEntity) => ({
  categoryId: category.categoryId,
  categoryName: category.categoryName,
  description: category.description,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
  status: category.status,
  productCount: category._count?.products ?? 0,
});

