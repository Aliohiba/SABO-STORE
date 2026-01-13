import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BackButton from "@/components/BackButton";
import { Eye, Pencil, Trash2, UserPlus, Users, X, Check, Shield, Lock, ArrowRight } from "lucide-react";

interface AdminUser {
    _id: string;
    username: string;
    email?: string;
    name?: string;
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface UserFormData {
    username: string;
    email: string;
    name: string;
    password: string;
    isActive: boolean;
}

export default function AdminUsers() {
    const [, setLocation] = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        username: "",
        email: "",
        name: "",
        password: "",
        isActive: true,
    });

    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const isAdmin = localStorage.getItem("adminToken");
        if (!isAdmin) {
            setLocation("/admin/login");
        }
    }, [setLocation]);

    const { data: users = [], refetch } = trpc.adminUsers.list.useQuery();
    const createUser = trpc.adminUsers.create.useMutation();
    const updateUser = trpc.adminUsers.update.useMutation();
    const deleteUser = trpc.adminUsers.delete.useMutation();
    const changePassword = trpc.admin.changePassword.useMutation();

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
            toast.error("يرجى ملء جميع الحقول");
            return;
        }

        if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
            toast.error("كلمات المرور الجديدة غير متطابقة");
            return;
        }

        if (passwordFormData.newPassword.length < 6) {
            toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
            return;
        }

        changePassword.mutate(
            {
                currentPassword: passwordFormData.currentPassword,
                newPassword: passwordFormData.newPassword,
            },
            {
                onSuccess: () => {
                    toast.success("تم تغيير كلمة المرور بنجاح");
                    setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                },
                onError: () => {
                    toast.error("فشل تغيير كلمة المرور");
                },
            }
        );
    };

    const handleOpenModal = (user?: AdminUser) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                email: user.email || "",
                name: user.name || "",
                password: "",
                isActive: user.isActive,
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: "",
                email: "",
                name: "",
                password: "",
                isActive: true,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
            username: "",
            email: "",
            name: "",
            password: "",
            isActive: true,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingUser) {
                // Update existing user
                const updateData: any = {
                    id: editingUser._id,
                    username: formData.username,
                    email: formData.email || undefined,
                    name: formData.name || undefined,
                    isActive: formData.isActive,
                };

                // Only include password if it's been changed
                if (formData.password) {
                    updateData.password = formData.password;
                }

                await updateUser.mutateAsync(updateData);
                toast.success("تم تحديث المستخدم بنجاح");
            } else {
                // Create new user
                if (!formData.password) {
                    toast.error("كلمة المرور مطلوبة للمستخدمين الجدد");
                    return;
                }

                await createUser.mutateAsync({
                    username: formData.username,
                    password: formData.password,
                    email: formData.email || undefined,
                    name: formData.name || undefined,
                    isActive: formData.isActive,
                });
                toast.success("تم إضافة المستخدم بنجاح");
            }

            refetch();
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.message || "حدث خطأ أثناء حفظ المستخدم");
        }
    };

    const handleDelete = async (userId: string, username: string) => {
        if (!confirm(`هل أنت متأكد من حذف المستخدم "${username}"؟`)) {
            return;
        }

        try {
            await deleteUser.mutateAsync({ id: userId });
            toast.success("تم حذف المستخدم بنجاح");
            refetch();
        } catch (error: any) {
            toast.error(error.message || "فشل حذف المستخدم");
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
                {/* Back Button */}
                <BackButton href="/admin/settings" label="العودة للإعدادات" />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <Users className="h-7 w-7 text-blue-600" />
                            </div>
                            إدارة المستخدمين
                        </h1>
                        <p className="text-gray-600 mt-2">إدارة جميع بيانات المستخدمين</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setLocation("/admin/settings/edit-permissions")}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        >
                            <Shield className="h-5 w-5" />
                            تعديل الصلاحيات
                        </Button>
                        <Button
                            onClick={() => handleOpenModal()}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        >
                            <UserPlus className="h-5 w-5" />
                            إضافة مستخدم
                        </Button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        الاسم
                                    </th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        اسم المستخدم
                                    </th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        البريد الإلكتروني
                                    </th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        المجموعة
                                    </th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        الحالة
                                    </th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        تاريخ الإنشاء
                                    </th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user: AdminUser) => (
                                    <tr key={user._id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="py-4 px-6 font-medium text-gray-900">
                                            {user.name || "-"}
                                        </td>
                                        <td className="py-4 px-6 text-gray-800 font-medium">
                                            {user.username}
                                        </td>
                                        <td className="py-4 px-6 text-gray-600 text-sm">
                                            {user.email || "-"}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                مسؤول أول
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {user.isActive ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Check className="h-3 w-3" />
                                                    نشط
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <X className="h-3 w-3" />
                                                    غير نشط
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-gray-500 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString("ar-LY")}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-all"
                                                    onClick={() => setLocation("/admin/settings/edit-permissions")}
                                                    title="تعديل الصلاحيات"
                                                >
                                                    <Shield className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all"
                                                    onClick={() => handleOpenModal(user)}
                                                    title="تعديل المستخدم"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                                                    onClick={() => handleDelete(user._id, user.username)}
                                                    title="حذف المستخدم"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {users.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mt-8">
                        <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">لا توجد مستخدمين حتى الآن</h3>
                        <p className="text-gray-500 mt-1">ابدأ بإضافة مستخدم جديد</p>
                    </div>
                )}

                {/* Change Password Section */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mt-8 max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <Lock className="h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">تغيير كلمة المرور</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الحالية</label>
                            <input
                                type="password"
                                value={passwordFormData.currentPassword}
                                onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="أدخل كلمة المرور الحالية"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                            <input
                                type="password"
                                value={passwordFormData.newPassword}
                                onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="أدخل كلمة المرور الجديدة"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                            <input
                                type="password"
                                value={passwordFormData.confirmPassword}
                                onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="أعد إدخال كلمة المرور الجديدة"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={changePassword.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            {changePassword.isPending ? "جاري التحديث..." : "تحديث كلمة المرور"}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    {editingUser ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الاسم
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="أدخل الاسم الكامل"
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم المستخدم <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="أدخل اسم المستخدم"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    البريد الإلكتروني
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="example@email.com"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    كلمة المرور {!editingUser && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder={editingUser ? "اتركه فارغاً إذا لم ترد التغيير" : "أدخل كلمة المرور"}
                                    required={!editingUser}
                                />
                                {editingUser && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        اترك هذا الحقل فارغاً إذا كنت لا تريد تغيير كلمة المرور
                                    </p>
                                )}
                            </div>

                            {/* Group (Read-only for now) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المجموعة
                                </label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                    disabled
                                >
                                    <option>مسؤول أول</option>
                                </select>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    المستخدم نشط
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                                    disabled={createUser.isPending || updateUser.isPending}
                                >
                                    {createUser.isPending || updateUser.isPending ? "جاري الحفظ..." : "حفظ"}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleCloseModal}
                                    variant="outline"
                                    className="flex-1 border-2 border-gray-300 hover:bg-gray-50 py-3 rounded-lg font-medium transition-all"
                                >
                                    إلغاء
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
