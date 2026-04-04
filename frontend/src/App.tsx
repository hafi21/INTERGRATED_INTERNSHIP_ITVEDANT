import { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { FloatingBackdrop } from "./components/layout/floating-backdrop";
import { Footer } from "./components/layout/footer";
import { Navbar } from "./components/layout/navbar";
import { ProtectedRoute } from "./components/layout/protected-route";

const HomePage = lazy(() => import("./pages/home-page").then((module) => ({ default: module.HomePage })));
const LoginPage = lazy(() => import("./pages/login-page").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() =>
  import("./pages/register-page").then((module) => ({ default: module.RegisterPage })),
);
const ProductsPage = lazy(() =>
  import("./pages/products-page").then((module) => ({ default: module.ProductsPage })),
);
const ProductDetailsPage = lazy(() =>
  import("./pages/product-details-page").then((module) => ({ default: module.ProductDetailsPage })),
);
const CartPage = lazy(() => import("./pages/cart-page").then((module) => ({ default: module.CartPage })));
const WishlistPage = lazy(() => import("./pages/wishlist-page").then((module) => ({ default: module.WishlistPage })));
const OrdersPage = lazy(() =>
  import("./pages/orders-page").then((module) => ({ default: module.OrdersPage })),
);
const OrderTrackingPage = lazy(() =>
  import("./pages/order-tracking-page").then((module) => ({ default: module.OrderTracking })),
);
const TrackShipmentPage = lazy(() =>
  import("./pages/track-shipment-page").then((module) => ({ default: module.TrackShipmentPage })),
);
const AdminCustomersPage = lazy(() =>
  import("./pages/admin-customers-page").then((module) => ({ default: module.AdminCustomersPage })),
);
const AdminOrdersPage = lazy(() =>
  import("./pages/admin-orders-page").then((module) => ({ default: module.AdminOrdersPage })),
);
const AdminPaymentsPage = lazy(() =>
  import("./pages/admin-payments-page").then((module) => ({ default: module.AdminPaymentsPage })),
);
const AdminCategoriesPage = lazy(() =>
  import("./pages/admin-categories-page").then((module) => ({ default: module.AdminCategoriesPage })),
);
const AdminProductsPage = lazy(() =>
  import("./pages/admin-products-page").then((module) => ({ default: module.AdminProductsPage })),
);
const AdminCouponsPage = lazy(() =>
  import("./pages/admin-coupons-page").then((module) => ({ default: module.AdminCouponsPage })),
);
const AdminReviewsPage = lazy(() =>
  import("./pages/admin-reviews-page").then((module) => ({ default: module.AdminReviewsPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/not-found-page").then((module) => ({ default: module.NotFoundPage })),
);

const PageTransition = ({ children }: { children: JSX.Element }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.35 }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <FloatingBackdrop />
      <Navbar />
      <Suspense fallback={<div className="section-shell py-24 text-center text-slate-500">Loading experience...</div>}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <HomePage />
                </PageTransition>
              }
            />
            <Route
              path="/login"
              element={
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              }
            />
            <Route
              path="/register"
              element={
                <PageTransition>
                  <RegisterPage />
                </PageTransition>
              }
            />
            <Route
              path="/products"
              element={
                <PageTransition>
                  <ProductsPage />
                </PageTransition>
              }
            />
            <Route
              path="/products/:id"
              element={
                <PageTransition>
                  <ProductDetailsPage />
                </PageTransition>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <CartPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <WishlistPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <OrdersPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId/track"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <OrderTrackingPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/track-shipment"
              element={
                <PageTransition>
                  <TrackShipmentPage />
                </PageTransition>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute adminOnly>
                  <PageTransition>
                    <AdminPaymentsPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute adminOnly>
                  <PageTransition>
                    <AdminOrdersPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <ProtectedRoute adminOnly>
                  <PageTransition>
                    <AdminCustomersPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute adminOnly>
                  <PageTransition>
                    <AdminCategoriesPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute adminOnly>
                  <PageTransition>
                    <AdminProductsPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <ProtectedRoute adminOnly>
                  <PageTransition>
                    <AdminCouponsPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute adminOnly>
                  <PageTransition>
                    <AdminReviewsPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <PageTransition>
                  <NotFoundPage />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <Footer />
    </div>
  );
}
