import { useEffect } from "react";
import { useLocation } from "wouter";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminSupport() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminToken");
    if (!isAdmin) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  if (!localStorage.getItem("adminToken")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar activePath="/admin/support" />

      {/* Main Content */}
      <div className="lg:mr-72 lg:p-8 ml-0 p-4 transition-all duration-300">
        <h1 className="text-3xl font-bold mb-8">الدعم</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">صفحة الدعم قيد التطوير...</p>
        </div>
      </div>
    </div>
  );
}

