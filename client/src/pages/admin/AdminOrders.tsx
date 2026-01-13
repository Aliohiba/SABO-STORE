import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Eye, Trash2, ShoppingCart, Plus, Search, RefreshCw } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminToken");
    if (!isAdmin) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: orders = [], refetch } = trpc.orders.all.useQuery();
  const updateStatus = trpc.orders.updateStatus.useMutation();
  const deleteOrder = trpc.orders.delete.useMutation();
  const deleteManyMutation = trpc.orders.deleteMany.useMutation();
  const togglePayment = trpc.orders.togglePaymentStatus.useMutation();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const { confirm, ConfirmDialog } = useConfirm();

  const handleStatusChange = async (orderId: number, newStatus: string, currentStatus: string, orderNumber: string) => {
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
    if (!validStatuses.includes(newStatus as typeof validStatuses[number])) {
      toast.error("حالة الطلب غير صحيحة");
      return;
    }

    if (newStatus === currentStatus) return;

    const statusLabels: Record<string, string> = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      shipped: "مشحون",
      delivered: "تم التسليم",
      cancelled: "ملغى"
    };

    const confirmed = await confirm({
      title: "تغيير حالة الطلب",
      message: `هل تريد تغيير حالة الطلب #${orderNumber} إلى "${statusLabels[newStatus]}"؟`,
      confirmText: "نعم، غيّر الحالة",
      cancelText: "إلغاء",
      type: newStatus === "cancelled" ? "danger" : "default"
    });

    if (!confirmed) return;

    const toastId = toast.loading("جاري تحديث الحالة...");

    updateStatus.mutate(
      { id: orderId, status: newStatus as typeof validStatuses[number] },
      {
        onSuccess: () => {
          refetch();
          toast.dismiss(toastId);
          toast.success("تم تحديث حالة الطلب");
        },
        onError: (error) => {
          toast.dismiss(toastId);
          toast.error("فشل التحديث: " + error.message);
        }
      }
    );
  };

  const handlePaymentToggle = (orderId: string, currentStatus: boolean, paymentMethod: string) => {
    if (paymentMethod === 'moamalat') return;

    togglePayment.mutate(
      { id: orderId, isPaid: !currentStatus },
      {
        onSuccess: () => {
          refetch();
          toast.success(!currentStatus ? "تم تعيين الطلب كمدفوع" : "تم إلغاء دفع الطلب");
        },
        onError: (error) => {
          toast.error("فشل تحديث حالة الدفع: " + error.message);
        }
      }
    );
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    const confirmed = await confirm({
      title: "حذف الطلب",
      message: `هل أنت متأكد من حذف الطلب ${orderNumber}؟ لن تتمكن من التراجع عن هذا الإجراء.`,
      confirmText: "نعم، احذف",
      cancelText: "إلغاء",
      type: "danger"
    });

    if (!confirmed) return;

    deleteOrder.mutate(
      { id: orderId },
      {
        onSuccess: () => {
          refetch();
          setSelectedOrders(prev => prev.filter(id => id !== orderId));
          toast.success("تم حذف الطلب بنجاح");
        },
        onError: (error) => {
          toast.error("فشل حذف الطلب: " + error.message);
        },
      }
    );
  };

  const handleSelectAll = () => {
    const filtered = getFilteredOrders();
    if (selectedOrders.length === filtered.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filtered.map((o: any) => o._id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) {
      toast.error("يرجى تحديد طلبات للحذف");
      return;
    }

    const confirmed = await confirm({
      title: "حذف الطلبات المحددة",
      message: `هل أنت متأكد من حذف ${selectedOrders.length} طلب؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: "نعم، احذف الكل",
      cancelText: "إلغاء",
      type: "danger"
    });

    if (!confirmed) return;

    try {
      await deleteManyMutation.mutateAsync({ ids: selectedOrders });
      toast.success(`تم حذف ${selectedOrders.length} طلب بنجاح`);
      refetch();
      setSelectedOrders([]);
    } catch (error: any) {
      toast.error(error.message || "فشل حذف الطلبات");
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedOrders.length === 0) {
      toast.error("يرجى تحديد طلبات لتغيير حالتها");
      return;
    }

    const statusLabels: Record<string, string> = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      shipped: "مشحون",
      delivered: "تم التسليم",
      cancelled: "ملغى"
    };

    const confirmed = await confirm({
      title: "تغيير حالة الطلبات المحددة",
      message: `هل تريد تغيير حالة ${selectedOrders.length} طلب إلى "${statusLabels[newStatus]}"؟`,
      confirmText: "نعم، غيّر الحالة",
      cancelText: "إلغاء",
      type: newStatus === "cancelled" ? "danger" : "default"
    });

    if (!confirmed) return;

    const toastId = toast.loading(`جاري تحديث ${selectedOrders.length} طلب...`);

    try {
      for (const orderId of selectedOrders) {
        await updateStatus.mutateAsync({
          id: orderId,
          status: newStatus as any
        });
      }

      refetch();
      toast.dismiss(toastId);
      toast.success(`تم تحديث حالة ${selectedOrders.length} طلب بنجاح`);
      setSelectedOrders([]);
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error("فشل تحديث بعض الطلبات: " + error.message);
    }
  };

  const getFilteredOrders = () => {
    return orders.filter((order: any) => {
      // Filter by status
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // Filter by payment
      if (paymentFilter === "paid" && !order.isPaid) {
        return false;
      }
      if (paymentFilter === "unpaid" && order.isPaid) {
        return false;
      }

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          order.orderNumber?.toLowerCase().includes(query) ||
          order.customerName?.toLowerCase().includes(query) ||
          order.customerPhone?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  };

  if (!localStorage.getItem("adminToken")) {
    return null;
  }

  const filteredOrders = getFilteredOrders();
  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o: any) => o.status === "pending").length,
    confirmed: orders.filter((o: any) => o.status === "confirmed").length,
    shipped: orders.filter((o: any) => o.status === "shipped").length,
    delivered: orders.filter((o: any) => o.status === "delivered").length,
    cancelled: orders.filter((o: any) => o.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activePath="/admin/orders" />

      <div className="lg:mr-72 lg:p-8 ml-0 p-4 transition-all duration-300" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">الطلبات</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                refetch();
                toast.success("تم تحديث الصفحة");
              }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>
            <Link href="/checkout">
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                إضافة طلب
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className={statusFilter === "all" ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              جميع الطلبات ({statusCounts.all})
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
              className={statusFilter === "pending" ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              طلب جديد ({statusCounts.pending})
            </Button>
            <Button
              variant={statusFilter === "confirmed" ? "default" : "outline"}
              onClick={() => setStatusFilter("confirmed")}
              className={statusFilter === "confirmed" ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              قيد التجهيز ({statusCounts.confirmed})
            </Button>
            <Button
              variant={statusFilter === "shipped" ? "default" : "outline"}
              onClick={() => setStatusFilter("shipped")}
              className={statusFilter === "shipped" ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              قيد التوصيل ({statusCounts.shipped})
            </Button>
            <Button
              variant={statusFilter === "delivered" ? "default" : "outline"}
              onClick={() => setStatusFilter("delivered")}
              className={statusFilter === "delivered" ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              تم التسليم ({statusCounts.delivered})
            </Button>
            <Button
              variant={statusFilter === "cancelled" ? "default" : "outline"}
              onClick={() => setStatusFilter("cancelled")}
              className={statusFilter === "cancelled" ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              ملغي ({statusCounts.cancelled})
            </Button>
          </div>

          {/* Payment Filter & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <RadioGroup value={paymentFilter} onValueChange={setPaymentFilter} className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer">الكل</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid" className="cursor-pointer">مدفوع</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="unpaid" id="unpaid" />
                <Label htmlFor="unpaid" className="cursor-pointer">غير مدفوع</Label>
              </div>
            </RadioGroup>

            <div className="flex-1 flex gap-2">
              <Input
                type="text"
                placeholder="رقم الطلب، اسم الزبون، رقم الهاتف"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">
                <Search className="h-4 w-4 ml-2" />
                بحث
              </Button>
            </div>
          </div>

          {/* Actions for selected */}
          {selectedOrders.length > 0 && (
            <div className="mt-4 flex gap-2 items-center">
              <span className="text-sm font-medium">{selectedOrders.length} محدد</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    إجراءات ▼
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>تغيير الحالة</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkStatusChange("pending")}>
                    قيد الانتظار
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange("confirmed")}>
                    مؤكد
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange("shipped")}>
                    مشحون
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange("delivered")}>
                    تم التسليم
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleBulkStatusChange("cancelled")}
                    className="text-red-600"
                  >
                    إلغاء الطلبات
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDeleteSelected}
                    className="text-red-600"
                  >
                    حذف المحدد
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="w-12 py-4 px-6">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">اسم الزبون</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">القيمة</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">المدفوع</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">طريقة الدفع</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">تاريخ الطلب</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order: any) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    onClick={() => setLocation(`/admin/orders/${order._id}`)}
                  >
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedOrders.includes(order._id)}
                          onCheckedChange={() => handleSelectOrder(order._id)}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">#{order.orderNumber}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{order.customerName}</span>
                        <span className="text-xs text-gray-500">{order.customerPhone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-medium inline-block ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                          order.status === "shipped" ? "bg-purple-100 text-purple-800" :
                            order.status === "delivered" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                        }`}>
                        {order.status === "pending" ? "قيد الانتظار" :
                          order.status === "confirmed" ? "مؤكد" :
                            order.status === "shipped" ? "مشحون" :
                              order.status === "delivered" ? "تم التسليم" :
                                "ملغى"}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {parseFloat(order.totalAmount).toFixed(2)} د.ل
                    </td>
                    <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                      {order.paymentMethod === 'moamalat' ? (
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {order.isPaid ? "مدفوع" : "في انتظار"}
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePaymentToggle(order._id, order.isPaid, order.paymentMethod)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors border ${order.isPaid
                            ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                            : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                            }`}
                        >
                          {order.isPaid ? "تم الدفع" : "غير مدفوع"}
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            order.paymentMethod === 'moamalat' ? '/moamalat.png' :
                              order.paymentMethod === 'lypay' ? '/lypay.png' :
                                '/cash-payment.png'
                          }
                          alt={order.paymentMethod}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span className="text-sm text-gray-600">
                          {
                            order.paymentMethod === 'moamalat' ? 'تداول' :
                              order.paymentMethod === 'lypay' ? 'لي باي' :
                                'نقداً'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString("ar-LY")}
                    </td>
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1 justify-center">
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

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mt-8">
            <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">لا توجد طلبات</h3>
            <p className="text-gray-500 mt-1">لا توجد طلبات تطابق الفلاتر المحددة</p>
          </div>
        )}
      </div>

      <ConfirmDialog />
    </div>
  );
}
