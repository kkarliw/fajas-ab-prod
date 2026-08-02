import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "./components/ScrollToTop.tsx";
import CartDrawer from "./components/CartDrawer.tsx";
import { CookieBanner } from "./components/CookieBanner.tsx";

import { CartProvider } from "./context/CartContext.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import AdminRoute from "./components/AdminRoute.tsx";

const Index = lazy(() => import("./pages/Index.tsx"));
const Shop = lazy(() => import("./pages/Shop.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const SizeGuide = lazy(() => import("./pages/SizeGuide.tsx"));
const CareGuide = lazy(() => import("./pages/CareGuide.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const PQR = lazy(() => import("./pages/PQR.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const TermsConditions = lazy(() => import("./pages/TermsConditions.tsx"));
const ShippingReturns = lazy(() => import("./pages/ShippingReturns.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const CheckoutAuth = lazy(() => import("./pages/CheckoutAuth.tsx"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess.tsx"));
const CheckoutError = lazy(() => import("./pages/CheckoutError.tsx"));
const Account = lazy(() => import("./pages/Account.tsx"));
const Track = lazy(() => import("./pages/Track.tsx"));
const TestimonialCreate = lazy(() => import("./pages/TestimonialCreate.tsx"));

// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.tsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.tsx"));
const AdminPQRs = lazy(() => import("./pages/admin/AdminPQRs.tsx"));
const AdminSubscribers = lazy(() => import("./pages/admin/AdminSubscribers.tsx"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons.tsx"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials.tsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.tsx"));

const queryClient = new QueryClient();
if (typeof window !== "undefined") {
  (window as any).__queryClient = queryClient;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CartProvider>
          <ScrollToTop />
          <CartDrawer />
          <CookieBanner />

          <Suspense
            fallback = {
              <div className="min-h-screen flex items-center justify-center bg-cream">
                <div
                  className="h-10 w-10 border-2 border-foreground border-t-transparent animate-spin"
                  aria-label="Cargando"
                />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/size-guide" element={<SizeGuide />} />
              <Route path="/care" element={<CareGuide />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/pqr" element={<PQR />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/shipping" element={<ShippingReturns />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/checkout/auth" element={<CheckoutAuth />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/error" element={<CheckoutError />} />
              <Route path="/track" element={<Track />} />
              <Route path="/rastreo" element={<Track />} />
              <Route path="/testimonios/nuevo" element={<TestimonialCreate />} />
              <Route
                path="/account"
                element={
                  <PrivateRoute>
                    <Account />
                  </PrivateRoute>
                }
              />
              
              {/* Admin Panel Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/pqrs"
                element={
                  <AdminRoute>
                    <AdminPQRs />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/subscribers"
                element={
                  <AdminRoute>
                    <AdminSubscribers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/coupons"
                element={
                  <AdminRoute>
                    <AdminCoupons />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/testimonials"
                element={
                  <AdminRoute>
                    <AdminTestimonials />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
