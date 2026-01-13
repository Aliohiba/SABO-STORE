import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import React from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminFeaturedSections from "./pages/admin/AdminFeaturedSections";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProductNew from "./pages/admin/AdminProductNew";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminUsers from "./pages/admin/AdminUsers";
import EditPermissions from "./pages/admin/EditPermissions";
import AdminMarketing from "@/pages/admin/AdminMarketing";
import AdminSupport from "@/pages/admin/AdminSupport";
import AdminShipments from "./pages/admin/AdminShipments";

import AdminDelivery from "@/pages/admin/AdminDelivery";
import AdminDeliveryVanex from "@/pages/admin/AdminDeliveryVanex";
import AdminDeliveryDarbSabil from "@/pages/admin/AdminDeliveryDarbSabil";
import StoreSettings from "./pages/admin/StoreSettings";
import AdminTheme from "./pages/admin/AdminTheme";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminSalesReport from "./pages/admin/AdminSalesReport";
import AdminProductsCategoriesSettings from "./pages/admin/AdminProductsCategoriesSettings";
import AdminOrderSettings from "./pages/admin/AdminOrderSettings";

import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import MyOrders from "./pages/MyOrders";

function AdminRedirect() {
  const [, setLocation] = useLocation();
  React.useEffect(() => {
    setLocation("/admin/login");
  }, [setLocation]);
  return <div>جاري التوجيه...</div>;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/products"} component={Products} />
      <Route path={"/products/:id"} component={ProductDetail} />
      <Route path={"/cart"} component={Cart} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/order-confirmation/:orderId"} component={OrderConfirmation} />


      {/* Customer Routes */}
      <Route path={"/login"} component={Login} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/register"} component={Register} />

      {/* Public Tracking Route - No login required */}
      <Route path={"/track/:key?"} component={OrderTracking} />
      <Route path={"/track"} component={OrderTracking} />

      <Route path={"/my-orders"} component={MyOrders} />
      <Route path={"/track-order/:orderId"}>
        <ProtectedRoute>
          <OrderTracking />
        </ProtectedRoute>
      </Route>

      {/* Admin Routes - يجب أن تكون المسارات الأكثر تحديداً أولاً */}
      <Route path={"/admin/login"} component={Login} />
      <Route path={"/admin/products/new"}>
        <ProtectedRoute requireAdmin={true}>
          <AdminProductNew />
        </ProtectedRoute>
      </Route>
      <Route path={"/admin/products/:id"}>
        <ProtectedRoute requireAdmin={true}>
          <AdminProductEdit />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/orders/:id">
        <ProtectedRoute requireAdmin={true}>
          <AdminOrderDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/finance">
        <ProtectedRoute requireAdmin={true}>
          <AdminFinance />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/reports/sales">
        <ProtectedRoute requireAdmin={true}>
          <AdminSalesReport />
        </ProtectedRoute>
      </Route>

      {/* Delivery Settings Routes */}
      <Route path="/admin/settings/delivery/vanex">
        <ProtectedRoute requireAdmin={true}>
          <AdminDeliveryVanex />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings/delivery/darb-sabil">
        <ProtectedRoute requireAdmin={true}>
          <AdminDeliveryDarbSabil />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings/delivery">
        <ProtectedRoute requireAdmin={true}>
          <AdminDelivery />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/settings/edit-permissions">
        <ProtectedRoute requireAdmin={true}>
          <EditPermissions />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings/users">
        <ProtectedRoute requireAdmin={true}>
          <AdminUsers />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings/products-categories">
        <ProtectedRoute requireAdmin={true}>
          <AdminProductsCategoriesSettings />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings/orders">
        <ProtectedRoute requireAdmin={true}>
          <AdminOrderSettings />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute requireAdmin={true}>
          <AdminSettings />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/store-settings">
        <ProtectedRoute requireAdmin={true}>
          <StoreSettings />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/theme">
        <ProtectedRoute requireAdmin={true}>
          <AdminTheme />
        </ProtectedRoute>
      </Route>
      <Route path={"/admin/dashboard"}>
        <ProtectedRoute requireAdmin={true}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path={"/admin/products"}>
        <ProtectedRoute requireAdmin={true}>
          <AdminProducts />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/categories">
        <ProtectedRoute requireAdmin={true}>
          <AdminCategories />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/featured-sections">
        <ProtectedRoute requireAdmin={true}>
          <AdminFeaturedSections />
        </ProtectedRoute>
      </Route>
      <Route path={"/admin/orders"}>
        <ProtectedRoute requireAdmin={true}>
          <AdminOrders />
        </ProtectedRoute>
      </Route>
      <Route path={"/admin/customers"}>
        <ProtectedRoute requireAdmin={true}>
          <AdminCustomers />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/marketing">
        <ProtectedRoute requireAdmin={true}>
          <AdminMarketing />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/support">
        <ProtectedRoute requireAdmin={true}>
          <AdminSupport />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/shipments">
        <ProtectedRoute requireAdmin={true}>
          <AdminShipments />
        </ProtectedRoute>
      </Route>

      {/* Fallback for /admin/delivery to new settings hub */}
      <Route path="/admin/delivery">
        <ProtectedRoute requireAdmin={true}>
          <AdminDelivery />
        </ProtectedRoute>
      </Route>

      <Route path={"/admin"}>
        <AdminRedirect />
      </Route>

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

import StoreInitializer from "./components/StoreInitializer";

function App() {
  console.log("[App] App component rendering...");
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <StoreInitializer />
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
