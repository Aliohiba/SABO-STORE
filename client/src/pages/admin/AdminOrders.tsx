import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ShoppingCart, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const { data: orders = [], refetch } = trpc.orders.all.useQuery();
  const updateStatus = trpc.orders.updateStatus.useMutation();
  const [selectedStatus, setSelectedStatus] = useState<Record<number, string>>({});

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin/login");
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatus.mutate(
      { id: orderId, status: newStatus as any },
      {
        onSuccess: () => {
          refetch();
          toast.success("تم تحديث حالة الطلب");
        },
      }
    );
  };

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
              <ShoppingCart className="h-5 w-5" />
              لوحة التحكم
            </Button>
          </Link>

          <Link href="/admin/products">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-800 gap-2">
              <ShoppingCart className="h-5 w-5" />
              المنتجات
            </Button>
          </Link>

          <Link href="/admin/orders">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-800 gap-2">
              <ShoppingCart className="h-5 w-5" />
              الطلبات
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
        <h1 className="text-3xl font-bold mb-8">الطلبات</h1>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-right py-3 px-4">رقم الطلب</th>
                <th className="text-right py-3 px-4">العميل</th>
                <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                <th className="text-right py-3 px-4">الهاتف</th>
                <th className="text-right py-3 px-4">المبلغ</th>
                <th className="text-right py-3 px-4">الحالة</th>
                <th className="text-right py-3 px-4">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold">{order.orderNumber}</td>
                  <td className="py-3 px-4">{order.customerName}</td>
                  <td className="py-3 px-4">{order.customerEmail}</td>
                  <td className="py-3 px-4">{order.customerPhone}</td>
                  <td className="py-3 px-4">{parseFloat(order.totalAmount).toFixed(2)} دينار</td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium border-0 ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "shipped"
                          ? "bg-purple-100 text-purple-800"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="shipped">مشحون</option>
                      <option value="delivered">تم التسليم</option>
                      <option value="cancelled">ملغى</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString("ar-LY")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center mt-8">
            <p className="text-gray-500 text-lg">لا توجد طلبات حتى الآن</p>
          </div>
        )}
      </div>
    </div>
  );
}
