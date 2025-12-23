import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Settings, LogOut, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const changePassword = trpc.admin.changePassword.useMutation();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin/login");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("كلمات المرور الجديدة غير متطابقة");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    changePassword.mutate(
      {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("تم تغيير كلمة المرور بنجاح");
          setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
        onError: () => {
          toast.error("فشل تغيير كلمة المرور");
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
              <Settings className="h-5 w-5" />
              لوحة التحكم
            </Button>
          </Link>

          <Link href="/admin/products">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-800 gap-2">
              <Settings className="h-5 w-5" />
              المنتجات
            </Button>
          </Link>

          <Link href="/admin/orders">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-800 gap-2">
              <Settings className="h-5 w-5" />
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
        <h1 className="text-3xl font-bold mb-8">الإعدادات</h1>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold">تغيير كلمة المرور</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الحالية</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <Button
              type="submit"
              disabled={changePassword.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
            >
              {changePassword.isPending ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </Button>
          </form>
        </div>

        {/* Other Settings */}
        <div className="bg-white rounded-lg shadow p-6 mt-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">معلومات المتجر</h2>
          <div className="space-y-3 text-gray-700">
            <div>
              <p className="text-sm text-gray-600">اسم المتجر</p>
              <p className="font-bold">SABO STORE</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">البريد الإلكتروني</p>
              <p className="font-bold">admin@sabostore.com</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">الإصدار</p>
              <p className="font-bold">1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
