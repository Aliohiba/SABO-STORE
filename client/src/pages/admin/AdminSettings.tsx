import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Store, Users, Tag, ShoppingCart, Truck, Link as LinkIcon } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminSettings() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    console.log("[AdminSettings] Current location:", location);
    const isAdmin = localStorage.getItem("adminToken");
    if (!isAdmin) {
      console.log("[AdminSettings] No admin token, redirecting to login");
      setLocation("/admin/login");
    }
  }, [setLocation, location]);

  if (!localStorage.getItem("adminToken")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar activePath="/admin/settings" />

      {/* Main Content */}
      <div className="lg:mr-72 lg:p-8 ml-0 p-4">
        <h1 className="text-3xl font-bold mb-8">الإعدادات</h1>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* التطبيقات */}
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <LinkIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-600 mb-1">التطبيقات</h3>
                <p className="text-sm text-gray-600">تفعيل الربط مع التطبيقات الهامة لمتجرك.</p>
              </div>
            </div>
          </div>

          {/* المتجر */}
          <Link href="/admin/store-settings">
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Store className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-600 mb-1">المتجر</h3>
                  <p className="text-sm text-gray-600">إعدادات خاصة بواجهة المتجر والهوية البصرية</p>
                </div>
              </div>
            </div>
          </Link>

          {/* إدارة المستخدمين */}
          <Link href="/admin/settings/users">
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-600 mb-1">إدارة المستخدمين</h3>
                  <p className="text-sm text-gray-600">إدارة جميع بيانات المستخدمين</p>
                </div>
              </div>
            </div>
          </Link>

          {/* المنتجات والتصنيفات */}
          <Link href="/admin/settings/products-categories">
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Tag className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-600 mb-1">المنتجات والتصنيفات</h3>
                  <p className="text-sm text-gray-600">إدارة المنتجات وتصنيفات المتجر</p>
                </div>
              </div>
            </div>
          </Link>

          {/* الطلبات */}
          <Link href="/admin/settings/orders">
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-600 mb-1">الطلبات</h3>
                  <p className="text-sm text-gray-600">الإعدادات الافتراضية للطلبات</p>
                </div>
              </div>
            </div>
          </Link>

          {/* التوصيل */}
          <Link href="/admin/delivery">
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Truck className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-600 mb-1">التوصيل</h3>
                  <p className="text-sm text-gray-600">إعدادات التوصيل والربط مع شركات التوصيل المعتمدة</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
