import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ArrowRight, Save } from "lucide-react";

interface Permission {
    id: string;
    label: string;
    checked: boolean;
}

interface PermissionSection {
    title: string;
    permissions: Permission[];
}

export default function EditPermissions() {
    const [, setLocation] = useLocation();
    const [selectedRole, setSelectedRole] = useState("admin");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const isAdmin = localStorage.getItem("adminToken");
        if (!isAdmin) {
            setLocation("/admin/login");
        }
    }, [setLocation]);

    // Define all permission sections based on the live site
    const [permissionSections, setPermissionSections] = useState<PermissionSection[]>([
        {
            title: "الرئيسية",
            permissions: [
                { id: "dashboard_view", label: "عرض ملخص الشهر", checked: true }
            ]
        },
        {
            title: "الطلبات",
            permissions: [
                { id: "orders_view", label: "عرض الطلبات", checked: true },
                { id: "orders_view_own", label: "عرض طلبات المستخدم فقط", checked: false },
                { id: "orders_add", label: "إضافة", checked: true },
                { id: "orders_edit", label: "تعديل", checked: true },
                { id: "orders_accept", label: "قبول", checked: true },
                { id: "orders_ship", label: "تسجيل الشحنة", checked: true },
                { id: "orders_cancel", label: "إلغاء", checked: true },
                { id: "orders_print", label: "طباعة", checked: true }
            ]
        },
        {
            title: "المنتجات والتصنيفات",
            permissions: [
                { id: "products_view", label: "عرض المنتجات", checked: true },
                { id: "products_add", label: "إضافة", checked: true },
                { id: "products_edit", label: "تعديل", checked: true },
                { id: "products_delete", label: "حذف منتجات", checked: true },
                { id: "categories_view", label: "عرض التصنيفات", checked: true },
                { id: "categories_add", label: "إضافة تصنيف", checked: true },
                { id: "categories_edit", label: "تعديل", checked: true },
                { id: "categories_delete", label: "حذف", checked: true }
            ]
        },
        {
            title: "العملاء",
            permissions: [
                { id: "customers_view", label: "عرض العملاء", checked: true },
                { id: "customers_add", label: "إضافة عميل", checked: true },
                { id: "customers_edit", label: "تعديل", checked: true },
                { id: "customers_cancel", label: "إلغاء", checked: true }
            ]
        },
        {
            title: "التسويق",
            permissions: [
                { id: "coupons_view", label: "عرض الكوبونات", checked: true },
                { id: "coupons_add", label: "إضافة", checked: true },
                { id: "coupons_delete", label: "حذف", checked: true },
                { id: "affiliates_view", label: "عرض التسويق بالعمولة", checked: true },
                { id: "affiliates_add", label: "إضافة مسوق بالعمولة", checked: true },
                { id: "affiliates_edit", label: "تعديل مسوق بالعمولة", checked: true },
                { id: "affiliates_delete", label: "حذف مسوق بالعمولة", checked: true }
            ]
        },
        {
            title: "الدعم والمساعدة",
            permissions: [
                { id: "support_view", label: "عرض التذاكر", checked: true },
                { id: "support_add", label: "إضافة تذكرة", checked: true },
                { id: "support_comment", label: "إضافة تعليق", checked: true },
                { id: "support_close", label: "إغلاق تذكرة", checked: true }
            ]
        },
        {
            title: "الإعدادات",
            permissions: [
                { id: "settings_view", label: "عرض شاشة الإعدادات الرئيسية", checked: true },
                { id: "settings_users_view", label: "عرض إعدادات المستخدمين", checked: true },
                { id: "settings_users_edit", label: "تعديل إعدادات المستخدمين", checked: true },
                { id: "settings_products_view", label: "عرض إعدادات المنتجات", checked: true },
                { id: "settings_products_edit", label: "تعديل إعدادات المنتجات", checked: true },
                { id: "settings_orders_view", label: "عرض إعدادات الطلبات", checked: true },
                { id: "settings_orders_edit", label: "تعديل إعدادات الطلبات", checked: true },
                { id: "settings_store_view", label: "عرض إعدادات المتجر", checked: true },
                { id: "settings_store_edit", label: "تعديل إعدادات المتجر", checked: true },
                { id: "settings_shipping_view", label: "عرض إعدادات التوصيل", checked: true },
                { id: "settings_shipping_edit", label: "تعديل إعدادات التوصيل", checked: true },
                { id: "settings_analytics_view", label: "عرض إعدادات التحليل", checked: true },
                { id: "settings_analytics_edit", label: "تعديل إعدادات التحليل", checked: true }
            ]
        }
    ]);

    const handlePermissionChange = (sectionIndex: number, permissionIndex: number) => {
        const newSections = [...permissionSections];
        newSections[sectionIndex].permissions[permissionIndex].checked =
            !newSections[sectionIndex].permissions[permissionIndex].checked;
        setPermissionSections(newSections);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Here you would save the permissions to the backend
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            toast.success("تم حفظ الصلاحيات بنجاح");
        } catch (error) {
            toast.error("حدث خطأ أثناء حفظ الصلاحيات");
        } finally {
            setIsSaving(false);
        }
    };

    if (!localStorage.getItem("adminToken")) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar activePath="/admin/settings" />

            {/* Main Content */}
            <div className="lg:mr-72 lg:p-8 ml-0 p-4 transition-all duration-300" dir="rtl">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => setLocation("/admin/settings/users")}
                                className="hover:bg-gray-100 rounded-full p-2"
                            >
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                            <h1 className="text-2xl font-bold text-gray-900">تعديل الصلاحيات</h1>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        >
                            <Save className="h-5 w-5" />
                            {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </Button>
                    </div>

                    {/* Role Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            اختر المجموعة
                        </label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                            <option value="admin">مسؤول أول</option>
                            <option value="manager">مدير</option>
                            <option value="employee">موظف</option>
                        </select>
                    </div>
                </div>

                {/* Permissions Sections */}
                <div className="space-y-6">
                    {permissionSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                                {section.title}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.permissions.map((permission, permissionIndex) => (
                                    <div
                                        key={permission.id}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            id={permission.id}
                                            checked={permission.checked}
                                            onChange={() => handlePermissionChange(sectionIndex, permissionIndex)}
                                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                        />
                                        <label
                                            htmlFor={permission.id}
                                            className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                                        >
                                            {permission.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Save Button */}
                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 px-8 py-3"
                    >
                        <Save className="h-5 w-5" />
                        {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
