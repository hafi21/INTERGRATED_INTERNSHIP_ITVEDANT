export type UserRole = "ADMIN" | "CUSTOMER";

export type User = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: boolean;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Customer = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  orderHistory: Array<{
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
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
  sku: string;
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

export type WishlistItem = {
  id: number;
  createdAt: string;
  product: Product & {
    isAvailable: boolean;
  };
};

export type WishlistResponse = {
  items: WishlistItem[];
  summary: {
    itemCount: number;
    availableCount: number;
  };
};

export type Order = {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  customer: {
    id: number;
    fullName: string;
    email: string;
  } | null;
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
  shipping?: {
    id: number;
    courierService: string | null;
    trackingNumber: string | null;
    shippingStatus: string;
  } | null;
  payment: {
    id: number;
    provider: string;
    paymentMethod: string | null;
    transactionRef: string;
    refundReference: string | null;
    amount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    refundedAt: string | null;
  } | null;
  coupon: {
    couponId: number;
    couponCode: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
  } | null;
};

export type Coupon = {
  couponId: number;
  couponCode: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  remainingUsage: number;
  minimumOrderAmount: number | null;
  applicableProductIds: number[];
  applicableCategoryIds: number[];
  status: boolean;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CouponApplySummary = {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  eligibleSubtotal: number;
};

export type PaymentRecord = {
  id: number;
  provider: string;
  paymentMethod: string | null;
  transactionRef: string;
  refundReference: string | null;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  refundedAt: string | null;
  order: {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    customer: {
      id: number;
      fullName: string;
      email: string;
    };
  };
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

export type Review = {
  reviewId: number;
  productId: number;
  customerId: number;
  rating: number;
  reviewText: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    fullName: string;
    email: string;
  } | null;
  product: {
    id: number;
    name: string;
    imageUrl: string;
  } | null;
};

export type ProductReviewResponse = {
  reviews: Review[];
  summary: {
    averageRating: number;
    totalReviews: number;
  };
  myReview: Review | null;
  permissions: {
    canReview: boolean;
    hasReviewed: boolean;
  };
};

export type ModerationReviewResponse = {
  reviews: Review[];
  summary: {
    total: number;
    pendingCount: number;
    approvedCount: number;
  };
};
