import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Tag, Package, Grid3x3, Layers, ArrowRight } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BackButton from "@/components/BackButton";

export default function AdminProductsCategoriesSettings() {
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
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminSidebar activePath="/admin/settings/products-categories" />

            {/* Main Content */}
            <div className="lg:mr-72 lg:p-8 ml-0 p-4" dir="rtl">
                <div className="mb-8">
                    <BackButton href="/admin/settings" label="العودة للإعدادات" />
                    <h1 className="text-3xl font-bold text-gray-900">المنتجات والتصنيفات</h1>
                    <p className="text-gray-600 mt-2">إدارة المنتجات وتصنيفات المتجر</p>
                </div>

                {/* Settings Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* قائمة المنتجات */}
                    <Link href="/admin/products">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Package className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                        قائمة المنتجات
                                    </h3>
                                    <p className="text-sm text-gray-600">عرض وإدارة جميع منتجات المتجر</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* التصنيفات */}
                    <Link href="/admin/categories">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-50 p-3 rounded-lg group-hover:bg-green-100 transition-colors">
                                    <Grid3x3 className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                                        التصنيفات
                                    </h3>
                                    <p className="text-sm text-gray-600">إدارة تصنيفات وفئات المنتجات</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* أقسام الصفحة الرئيسية */}
                    <Link href="/admin/featured-sections">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="bg-purple-50 p-3 rounded-lg group-hover:bg-purple-100 transition-colors">
                                    <Layers className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                                        أقسام الصفحة الرئيسية
                                    </h3>
                                    <p className="text-sm text-gray-600">تخصيص الأقسام المعروضة في الصفحة الرئيسية</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
