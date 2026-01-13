import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Eye, Pencil, Trash2, ListChecks } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";

export default function AdminActiveOrders() {
    const [, setLocation] = useLocation();

    useEffect(() => {
        const isAdmin = localStorage.getItem("adminToken");
        if (!isAdmin) {
            setLocation("/admin/login");
        }
    }, [setLocation]);

    const { data: allOrders = [], refetch } = trpc.orders.all.useQuery();
    const updateStatus = trpc.orders.updateStatus.useMutation();
    const deleteOrder = trpc.orders.delete.useMutation();
    const { confirm, ConfirmDialog } = useConfirm();

    // Filter Active Orders: Not cancelled AND Not delivered
    const activeOrders = allOrders.filter((order: any) =>
        order.status !== "cancelled" && order.status !== "delivered"
    );

    const handleStatusChange = (orderId: number, newStatus: string) => {
        const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
        if (!validStatuses.includes(newStatus as typeof validStatuses[number])) {
            toast.error("حالة الطلب غير صحيحة");
            return;
        }
        updateStatus.mutate(
            { id: orderId, status: newStatus as typeof validStatuses[number] },
            {
                onSuccess: () => {
                    refetch();
                    toast.success("تم تحديث حالة الطلب");
                },
            }
        );
    };

    const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
        const confirmed = await confirm({
            title: "حذف الطلب النشط",
            message: `هل أنت متأكد من حذف الطلب ${orderNumber}؟ هذا الطلب نشط حالياً!`,
            confirmText: "نعم، احذف",
            cancelText: "إلغاء",
            type: "danger"
        });

        if (!confirmed) {
            return;
        }

        deleteOrder.mutate(
            { id: orderId },
            {
                onSuccess: () => {
                    refetch();
                    toast.success("تم حذف الطلب بنجاح");
                },
                onError: (error) => {
                    toast.error("فشل حذف الطلب: " + error.message);
                },
            }
        );
    };

    if (!localStorage.getItem("adminToken")) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <AdminSidebar activePath="/admin/orders/active" />

            <div className="lg:mr-72 lg:p-8 p-4 ml-0 transition-all duration-300" dir="rtl">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">الطلبات النشطة</h1>

                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">العميل</th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">الهاتف</th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">المبلغ</th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">الحالة</th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">التاريخ</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeOrders.map((order: any) => (
                                    <tr key={order._id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-4 px-6 font-bold text-gray-900">#{order.orderNumber}</td>
                                        <td className="py-4 px-6 text-gray-800">{order.customerName}</td>
                                        <td className="py-4 px-6 text-gray-600 text-sm">{order.customerEmail}</td>
                                        <td className="py-4 px-6 text-gray-600 text-sm">{order.customerPhone}</td>
                                        <td className="py-4 px-6 font-medium text-gray-900">{parseFloat(order.totalAmount).toFixed(2)} د.ل</td>
                                        <td className="py-4 px-6">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 outline-none transition-all ${order.status === "pending"
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
                                        <td className="py-4 px-6 text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString("ar-LY")}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-2 justify-center">
                                                <Link href={`/admin/orders/${order._id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full"
                                                    onClick={() => toast.info("تعديل الطلب قريباً")}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                    onClick={() => handleDeleteOrder(order._id, order.orderNumber)}
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

                {activeOrders.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mt-8">
                        <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ListChecks className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">لا توجد طلبات نشطة حالياً</h3>
                        <p className="text-gray-500 mt-1">جميع الطلبات إما مكتملة أو ملغاة</p>
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog />
        </div>
    );
}
