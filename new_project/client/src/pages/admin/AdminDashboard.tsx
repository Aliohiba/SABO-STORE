import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Package, ShoppingCart, Settings, LogOut, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: orders = [] } = trpc.orders.all.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminToken");
    if (!isAdmin) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin/login");
  };

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-screen bg-blue-900 text-white p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">SABO STORE</h1>
          <p className="text-blue-200 text-sm">لوحة التحكم</p>
        </div>

        <nav className="space-y-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-800 gap-2">
              <BarChart3 className="h-5 w-5" />
              لوحة التحكم
            </Button>
          </Link>

          <Link href="/admin/products">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-800 gap-2">
              <Package className="h-5 w-5" />
              المنتجات
            </Button>
          </Link>

          <Link href="/admin/orders">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-800 gap-2">
              <ShoppingCart className="h-5 w-5" />
              الطلبات
            </Button>
          </Link>

          <Link href="/admin/settings">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-800 gap-2">
              <Settings className="h-5 w-5" />
              الإعدادات
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-white border-white hover:bg-blue-800 gap-2"
          >
            <LogOut className="h-5 w-5" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mr-64 p-8">
        <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي المنتجات</p>
                <p className="text-3xl font-bold text-blue-600">{products.length}</p>
              </div>
              <Package className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-green-600">{orders.length}</p>
              </div>
              <ShoppingCart className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">الطلبات المعلقة</p>
                <p className="text-3xl font-bold text-orange-600">{pendingOrders}</p>
              </div>
              <ShoppingCart className="h-12 w-12 text-orange-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-purple-600">{totalRevenue.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">آخر الطلبات</h2>

          {orders.length === 0 ? (
            <p className="text-gray-500">لا توجد طلبات حتى الآن</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-right py-3 px-4">رقم الطلب</th>
                    <th className="text-right py-3 px-4">العميل</th>
                    <th className="text-right py-3 px-4">المبلغ</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold">{order.orderNumber}</td>
                      <td className="py-3 px-4">{order.customerName}</td>
                      <td className="py-3 px-4">{parseFloat(order.totalAmount).toFixed(2)} دينار</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "shipped"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {order.status === "pending" && "قيد الانتظار"}
                          {order.status === "confirmed" && "مؤكد"}
                          {order.status === "shipped" && "مشحون"}
                          {order.status === "delivered" && "تم التسليم"}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString("ar-LY")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4">
            <Link href="/admin/orders">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">عرض جميع الطلبات</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
