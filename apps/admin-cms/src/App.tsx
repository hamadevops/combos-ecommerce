import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/providers/theme-provider";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./components/providers/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { GuestRoute } from "./components/auth/GuestRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
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
import OrderDetail from "./pages/admin/OrderDetail";
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
import SeoManagement from "./pages/admin/SeoManagement";
import AdminPopups from "./pages/admin/Popups";
import AdminPopupForm from "./pages/admin/AdminPopupForm";
import AdminPermissions from "./pages/admin/AdminPermissions";
import AdminPermissionForm from "./pages/admin/AdminPermissionForm";
import AdminPermissionGroups from "./pages/admin/AdminPermissionGroups";
import AdminPermissionGroupForm from "./pages/admin/AdminPermissionGroupForm";
import EmDashboard from "./pages/email-marketing/EmDashboard";
import EmCampaigns from "./pages/email-marketing/EmCampaigns";
import EmCampaignForm from "./pages/email-marketing/EmCampaignForm";
import EmCampaignDetail from "./pages/email-marketing/EmCampaignDetail";
import EmContacts from "./pages/email-marketing/EmContacts";
import EmSegments from "./pages/email-marketing/EmSegments";
import EmSegmentDetail from "./pages/email-marketing/EmSegmentDetail";
import EmTemplates from "./pages/email-marketing/EmTemplates";
import EmTemplateForm from "./pages/email-marketing/EmTemplateForm";
import EmSettings from "./pages/email-marketing/EmSettings";

const queryClient = new QueryClient();

import { GlobalPopup } from "./components/common/GlobalPopup";

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
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
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute excludedRoles={["user"]} />}>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/profile" element={<AdminProfile />} />
                <Route path="/categories" element={<AdminCategories />} />
                <Route path="/products" element={<AdminProducts />} />
                <Route path="/products/new" element={<AdminProductForm />} />
                <Route path="/products/edit/:id" element={<AdminProductForm />} />
                <Route path="/blog" element={<AdminBlog />} />
                <Route path="/blog/preview" element={<BlogPreview />} />
                <Route path="/blog/preview/:id" element={<BlogPreview />} />
                <Route path="/blog/new" element={<AdminBlogForm />} />
                <Route path="/blog/edit/:id" element={<AdminBlogForm />} />
                <Route path="/topics" element={<AdminTopics />} />
                <Route path="/tags" element={<AdminTags />} />
                <Route path="/customers" element={<AdminCustomers />} />
                <Route path="/orders" element={<AdminOrders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/settings" element={<AdminSettings />} />
                <Route path="/pages" element={<AdminPages />} />
                <Route path="/pages/create" element={<AdminPageForm />} />
                <Route path="/pages/edit/:id" element={<AdminPageForm />} />
                <Route path="/faqs" element={<AdminFaqs />} />
                <Route path="/faqs/create" element={<AdminFaqForm />} />
                <Route path="/faqs/edit/:id" element={<AdminFaqForm />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/users/create" element={<AdminUserForm />} />
                <Route path="/users/edit/:id" element={<AdminUserForm />} />
                <Route path="/roles" element={<AdminRoles />} />
                <Route path="/roles/create" element={<AdminRoleForm />} />
                <Route path="/roles/edit/:id" element={<AdminRoleForm />} />
                <Route path="/permissions" element={<AdminPermissions />} />
                <Route path="/permissions/create" element={<AdminPermissionForm />} />
                <Route path="/permissions/edit/:id" element={<AdminPermissionForm />} />
                <Route path="/permission-groups" element={<AdminPermissionGroups />} />
                <Route path="/permission-groups/create" element={<AdminPermissionGroupForm />} />
                <Route path="/permission-groups/edit/:id" element={<AdminPermissionGroupForm />} />
                <Route path="/webhooks" element={<Webhooks />} />
                <Route path="/seo" element={<SeoManagement />} />
                <Route path="/popups" element={<AdminPopups />} />
                <Route path="/popups/create" element={<AdminPopupForm />} />
                <Route path="/popups/edit/:id" element={<AdminPopupForm />} />

                {/* Email Marketing Routes */}
                <Route path="/email-marketing" element={<EmDashboard />} />
                <Route path="/email-marketing/settings" element={<EmSettings />} />
                <Route path="/email-marketing/contacts" element={<EmContacts />} />
                <Route path="/email-marketing/segments" element={<EmSegments />} />
                <Route path="/email-marketing/segments/:id" element={<EmSegmentDetail />} />
                <Route path="/email-marketing/templates" element={<EmTemplates />} />
                <Route path="/email-marketing/templates/new" element={<EmTemplateForm />} />
                <Route path="/email-marketing/templates/:id" element={<EmTemplateForm />} />
                <Route path="/email-marketing/templates/edit/:id" element={<EmTemplateForm />} />
                <Route path="/email-marketing/campaigns" element={<EmCampaigns />} />
                <Route path="/email-marketing/campaigns/new" element={<EmCampaignForm />} />
                <Route path="/email-marketing/campaigns/:id" element={<EmCampaignDetail />} />
              </Route>

              {/* Redirect / to /admin or /login if needed, or just 404 for now since user said keep ONLY admin/login */}
              {/* But usually root should redirect somewhere. For now sticking to instructions: DELETE client routes. */}

              {/* CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
