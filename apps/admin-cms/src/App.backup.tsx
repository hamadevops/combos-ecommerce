import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./components/providers/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { GuestRoute } from "./components/auth/GuestRoute";
import { MobileLayout } from "./components/layout/MobileLayout";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCategories from "./pages/admin/Categories";
import AdminProducts from "./pages/admin/Products";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminTags from "./pages/admin/Tags";
import AdminBlog from "./pages/admin/Blog";
import AdminBlogForm from "./pages/admin/AdminBlogForm";
import BlogPreview from "./pages/admin/BlogPreview";
import AdminTopics from "./pages/admin/Topics";
import AdminCustomers from "./pages/admin/Customers";
import AdminOrders from "./pages/admin/Orders";
import AdminSettings from "./pages/admin/Settings";
import AdminPages from "./pages/admin/Pages";
import AdminPageForm from "./pages/admin/AdminPageForm";
import AdminFaqs from "./pages/admin/Faqs";
import AdminFaqForm from "./pages/admin/AdminFaqForm";
import AdminRoles from "./pages/admin/Roles";
import AdminRoleForm from "./pages/admin/AdminRoleForm";
import AdminUsers from "./pages/admin/Users";
import AdminUserForm from "./pages/admin/AdminUserForm";
import AdminProfile from "./pages/admin/Profile";
import Webhooks from "./pages/admin/Webhooks";

const queryClient = new QueryClient();

import { GlobalPopup } from "./components/common/GlobalPopup";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <GlobalPopup />
          <Routes>
            {/* Public Auth Routes - Wrapped in GuestRoute */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              {/* <Route path="/register" element={<Register />} /> */}
            </Route>

            {/* Mobile Routes - Wrapped in Mobile Layout */}
            <Route element={<MobileLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:slug" element={<CategoryDetail />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute excludedRoles={["user"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products/new" element={<AdminProductForm />} />
              <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
              <Route path="/admin/blog" element={<AdminBlog />} />
              <Route path="/admin/blog/preview" element={<BlogPreview />} />
              <Route path="/admin/blog/new" element={<AdminBlogForm />} />
              <Route path="/admin/blog/edit/:id" element={<AdminBlogForm />} />
              <Route path="/admin/topics" element={<AdminTopics />} />
              <Route path="/admin/tags" element={<AdminTags />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/pages" element={<AdminPages />} />
              <Route path="/admin/pages/create" element={<AdminPageForm />} />
              <Route path="/admin/pages/edit/:id" element={<AdminPageForm />} />
              <Route path="/admin/faqs" element={<AdminFaqs />} />
              <Route path="/admin/faqs/create" element={<AdminFaqForm />} />
              <Route path="/admin/faqs/edit/:id" element={<AdminFaqForm />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/create" element={<AdminUserForm />} />
              <Route path="/admin/users/edit/:id" element={<AdminUserForm />} />
              <Route path="/admin/roles" element={<AdminRoles />} />
              <Route path="/admin/roles/create" element={<AdminRoleForm />} />
              <Route path="/admin/roles/edit/:id" element={<AdminRoleForm />} />
              <Route path="/admin/webhooks" element={<Webhooks />} />
            </Route>

            {/* CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
