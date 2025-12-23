import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Package, Plus, Edit2, Trash2, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminProducts() {
  const [, setLocation] = useLocation();
  const { data: products = [], refetch } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const deleteProduct = trpc.products.delete.useMutation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: 1,
    price: "",
    originalPrice: "",
    image: "",
    stock: 0,
    status: "available",
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin/login");
  };

  const handleDelete = (id: number) => {
    if (confirm("هل تريد حذف هذا المنتج؟")) {
      deleteProduct.mutate(
        { id },
        {
          onSuccess: () => {
            refetch();
            toast.success("تم حذف المنتج");
          },
        }
      );
    }
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
              <Package className="h-5 w-5" />
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
              <Package className="h-5 w-5" />
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">المنتجات</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="h-5 w-5" />
            إضافة منتج جديد
          </Button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-right py-3 px-4">المنتج</th>
                <th className="text-right py-3 px-4">الفئة</th>
                <th className="text-right py-3 px-4">السعر</th>
                <th className="text-right py-3 px-4">المخزون</th>
                <th className="text-right py-3 px-4">الحالة</th>
                <th className="text-right py-3 px-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold">{product.name}</td>
                  <td className="py-3 px-4">{categories.find((c) => c.id === product.categoryId)?.name}</td>
                  <td className="py-3 px-4">{parseFloat(product.price).toFixed(2)} دينار</td>
                  <td className="py-3 px-4">{product.stock}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.status === "available"
                          ? "bg-green-100 text-green-800"
                          : product.status === "unavailable"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {product.status === "available" && "متوفر"}
                      {product.status === "unavailable" && "غير متوفر"}
                      {product.status === "coming_soon" && "قريباً"}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50"
                      onClick={() => alert("قريباً")}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
