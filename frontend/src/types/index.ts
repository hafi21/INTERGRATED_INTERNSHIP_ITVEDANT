export type UserRole = "ADMIN" | "CUSTOMER";

export type User = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Category = {
  categoryId: number;
  categoryName: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  status: boolean;
  productCount: number;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  inventory: number;
  imageUrl: string;
  status: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  category?: {
    categoryId: number;
    categoryName: string;
  };
};

export type CartItem = {
  id: number;
  quantity: number;
  lineTotal: number;
  product: {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
    inventory: number;
    category: {
      categoryId: number;
      categoryName: string;
    };
  };
};

export type CartSummary = {
  itemCount: number;
  subtotal: number;
};

export type CartResponse = {
  items: CartItem[];
  summary: CartSummary;
};

export type Order = {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  items: Array<{
    id: number;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    product: {
      id: number;
      name: string;
      imageUrl: string;
    };
  }>;
  payment: {
    id: number;
    provider: string;
    transactionRef: string;
    amount: number;
    status: string;
    createdAt: string;
  } | null;
};

export type RazorpayCheckoutPayload = {
  keyId: string;
  order: Order;
  checkout: {
    razorpayOrderId: string;
    amount: number;
    currency: string;
  };
};
