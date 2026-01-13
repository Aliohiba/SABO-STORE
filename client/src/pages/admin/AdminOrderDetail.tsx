import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ArrowLeft, Truck, User, MapPin, Phone, Mail, Package, Save, X, Plus, Minus, Trash2, Printer } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function AdminOrderDetail() {
    const [, params] = useRoute("/admin/orders/:id");
    const [, setLocation] = useLocation();
    const orderId = params?.id || "";

    const [isEditing, setIsEditing] = useState(false);
    const [isEditingShipping, setIsEditingShipping] = useState(false);
    const [editedOrder, setEditedOrder] = useState<any>({});
    const [editedItems, setEditedItems] = useState<any[]>([]);
    const [newProduct, setNewProduct] = useState({ productId: "", quantity: 1 });

    useEffect(() => {
        const isAdmin = localStorage.getItem("adminToken");
        if (!isAdmin) {
            setLocation("/admin/login");
        }
    }, [setLocation]);

    const { data: order, refetch } = trpc.orders.getById.useQuery({ id: orderId });
    const cities = trpc.vanex.cities.useQuery();
    const { data: products = [] } = trpc.products.list.useQuery({ limit: 100, offset: 0 });
    const deleteOrder = trpc.orders.delete.useMutation();
    const updateOrder = trpc.orders.update.useMutation();

    const updateStatus = trpc.orders.updateStatus.useMutation();

    const { confirm: confirmAction, ConfirmDialog } = useConfirm();

    // Initialize editedOrder and editedItems when order data loads
    useEffect(() => {
        if (order) {
            setEditedOrder({
                customerName: order.customerName || "",
                customerEmail: order.customerEmail || "",
                customerPhone: order.customerPhone || "",
                customerAddress: order.customerAddress || "",
                cityId: (order as any).cityId || null,
                notes: order.notes || "",
            });
            setEditedItems(order.items || []);
        }
    }, [order]);

    const handleSaveOrder = () => {
        updateOrder.mutate(
            {
                id: orderId,
                ...editedOrder,
                items: isEditing ? editedItems.map(item => ({
                    productId: item.productId || item._id,
                    productName: item.productName || item.name,
                    quantity: item.quantity,
                    price: item.price,
                })) : undefined,
            },
            {
                onSuccess: () => {
                    toast.success("تم حفظ التغييرات بنجاح");
                    refetch();
                    setIsEditing(false);
                    setIsEditingShipping(false);
                },
                onError: (error) => {
                    toast.error("فشل حفظ التغييرات: " + error.message);
                },
            }
        );
    };





    const handleStatusUpdate = async (newStatus: string) => {
        let message = "هل أنت متأكد من تغيير حالة هذا الطلب؟";

        if (newStatus === "confirmed") {
            message = "سيتم تأكيد الطلب تخصيص المخزون وإرساله لشركة التوصيل (إن وجد). هل أنت متأكد؟";
        } else if (newStatus === "cancelled") {
            message = "سيتم إلغاء الطلب وتحرير المخزون المحجوز. هل أنت متأكد؟";
        }

        const isConfirmed = await confirmAction({
            title: "تغيير حالة الطلب",
            message: message,
            confirmText: "نعم، تغيير الحالة",
            cancelText: "إلغاء",
            type: newStatus === "cancelled" ? "danger" : "info"
        });

        if (isConfirmed) {
            updateStatus.mutate(
                { id: orderId, status: newStatus },
                {
                    onSuccess: () => {
                        toast.success("تم تحديث حالة الطلب بنجاح");
                        refetch();
                    },
                    onError: (error) => {
                        toast.error(error.message || "فشل تحديث حالة الطلب");
                    },
                }
            );
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setIsEditingShipping(false);
        if (order) {
            setEditedOrder({
                customerName: order.customerName || "",
                customerEmail: order.customerEmail || "",
                customerPhone: order.customerPhone || "",
                customerAddress: order.customerAddress || "",
                cityId: (order as any).cityId || null,
                notes: order.notes || "",
            });
            setEditedItems(order.items || []);
        }
    };

    const handleQuantityChange = (index: number, delta: number) => {
        const newItems = [...editedItems];
        const newQty = newItems[index].quantity + delta;
        if (newQty > 0) {
            newItems[index].quantity = newQty;
            setEditedItems(newItems);
        }
    };

    const handleRemoveItem = (index: number) => {
        setEditedItems(editedItems.filter((_, i) => i !== index));
    };

    const handleAddProduct = () => {
        if (!newProduct.productId) {
            toast.error("يرجى اختيار منتج");
            return;
        }
        const product = products.find((p: any) => p._id === newProduct.productId);
        if (!product) return;

        setEditedItems([
            ...editedItems,
            {
                productId: product._id,
                productName: product.name,
                quantity: newProduct.quantity,
                price: product.salePrice || product.price,
            },
        ]);
        setNewProduct({ productId: "", quantity: 1 });
        toast.success("تمت إضافة المنتج");
    };

    const calculateTotal = () => {
        return editedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    if (!localStorage.getItem("adminToken")) {
        return null;
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-100">
                <AdminSidebar activePath="/admin/orders" />
                <div className="lg:mr-72 p-8">
                    <div className="text-center">
                        <p className="text-gray-500 text-lg">جاري التحميل...</p>
                    </div>
                </div>
            </div>
        );
    }

    const selectedCity = cities.data?.find(c => c.id === editedOrder.cityId);



    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending": return "قيد الانتظار";
            case "confirmed": return "مؤكد";
            case "shipped": return "مشحون";
            case "delivered": return "تم التسليم";
            case "cancelled": return "ملغى";
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <AdminSidebar activePath="/admin/orders" />

            <div className="lg:mr-72 p-8" dir="rtl">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/orders">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 ml-2" />
                                العودة للطلبات
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                            <Printer className="h-4 w-4 ml-2" />
                            طباعة الفاتورة
                        </Button>
                        <h1 className="text-3xl font-bold">تفاصيل الطلب</h1>
                    </div>
                    <div className="flex gap-2">
                        {isEditing || isEditingShipping ? (
                            <>
                                <Button variant="outline" onClick={handleCancelEdit}>
                                    <X className="h-4 w-4 ml-2" />
                                    إلغاء
                                </Button>
                                <Button onClick={handleSaveOrder}>
                                    <Save className="h-4 w-4 ml-2" />
                                    حفظ التغييرات
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* Status Action Buttons */}
                                {order.status === 'pending' && (
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => handleStatusUpdate('confirmed')}
                                    >
                                        <Truck className="h-4 w-4 ml-2" />
                                        تأكيد الطلب
                                    </Button>
                                )}
                                {order.status === 'confirmed' && (
                                    <Button
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                        onClick={() => handleStatusUpdate('shipped')}
                                    >
                                        <Package className="h-4 w-4 ml-2" />
                                        تم الشحن
                                    </Button>
                                )}
                                {order.status === 'shipped' && (
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleStatusUpdate('delivered')}
                                    >
                                        <User className="h-4 w-4 ml-2" />
                                        تم التسليم
                                    </Button>
                                )}

                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    تعديل الطلب
                                </Button>

                                {order.status !== 'cancelled' && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleStatusUpdate('cancelled')}
                                    >
                                        إلغاء الطلب
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        if (confirm(`هل أنت متأكد من حذف الطلب ${order?.orderNumber} نهائياً؟`)) {
                                            deleteOrder.mutate(
                                                { id: orderId },
                                                {
                                                    onSuccess: () => {
                                                        toast.success("تم حذف الطلب بنجاح");
                                                        setLocation("/admin/orders");
                                                    },
                                                    onError: (error) => {
                                                        toast.error("فشل حذف الطلب: " + error.message);
                                                    },
                                                }
                                            );
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* Left Column: Payment & Totals (Takes 2 cols on large screens) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                المنتجات
                            </h2>
                            <div className="space-y-3">
                                {editedItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center border-b pb-3 last:border-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.productName || item.name || "منتج"}</p>
                                            <p className="text-sm text-gray-500">سعر الوحدة: {parseFloat(item.price).toFixed(2)} د.ل</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleQuantityChange(idx, -1)}><Minus className="h-4 w-4" /></Button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleQuantityChange(idx, 1)}><Plus className="h-4 w-4" /></Button>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => handleRemoveItem(idx)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 font-medium">x{item.quantity}</span>
                                            )}
                                            <p className="font-bold text-gray-900 min-w-[80px] text-left">
                                                {(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isEditing && (
                                <div className="mt-4 pt-4 border-t bg-gray-50 p-4 rounded-lg">
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 p-2 border rounded-md text-sm"
                                            value={newProduct.productId}
                                            onChange={(e) => setNewProduct({ ...newProduct, productId: e.target.value })}
                                        >
                                            <option value="">اختر منتج لإضافته...</option>
                                            {products.map((product: any) => (
                                                <option key={product._id} value={product._id}>
                                                    {product.name} ({product.salePrice || product.price} د.ل)
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            className="w-20 p-2 border rounded-md text-center"
                                            min="1"
                                            value={newProduct.quantity}
                                            onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 1 })}
                                        />
                                        <Button onClick={handleAddProduct} size="sm"><Plus className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Summary Card */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-6 border-b bg-gray-50/50">
                                <h3 className="text-lg font-bold flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        💰 طريقة الدفع
                                        <span className="text-sm font-normal text-gray-500 mx-2">•</span>
                                        <span className="text-base font-medium text-gray-700">
                                            {order.paymentMethod === 'cod' || order.paymentMethod === 'cash_on_delivery' ? 'عند الاستلام' :
                                                order.paymentMethod === 'moamalat' ? 'بطاقة مصرفية' :
                                                    order.paymentMethod === 'lypay' ? 'لي باي' : order.paymentMethod}
                                        </span>
                                    </span>
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>الإجمالي</span>
                                    <span className="font-medium text-gray-900">{parseFloat(order.totalAmount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span className="text-blue-600">تخفيض</span>
                                    <span className="font-medium text-gray-900">0</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
                                    <span>الصافي</span>
                                    <span>{parseFloat(order.totalAmount).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-6 border-t">
                                <h4 className="font-bold flex items-center gap-2 mb-4">
                                    الدفعات
                                    <span className="text-sm font-normal text-gray-400">•</span>
                                    <span className={`text - sm ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                        {order.isPaid ? 'مدفوعة' : 'غير مدفوعة'}
                                    </span>
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>إجمالي المدفوع</span>
                                        <span className="font-bold text-gray-900">{order.isPaid ? parseFloat(order.totalAmount).toFixed(2) : "0"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>المبلغ المتبقي</span>
                                        <span className="font-bold text-gray-900">{order.isPaid ? "0" : parseFloat(order.totalAmount).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer & Notes details (Takes 1 col on large screens) */}
                    <div className="space-y-6">
                        {/* Notes Card */}
                        <div className="bg-white rounded-lg shadow p-6 h-fit">
                            <h3 className="font-bold text-gray-900 mb-4 text-right">ملاحظات</h3>
                            {isEditing ? (
                                <textarea
                                    className="w-full p-3 border rounded-md text-right min-h-[100px]"
                                    value={editedOrder.notes}
                                    onChange={(e) => setEditedOrder({ ...editedOrder, notes: e.target.value })}
                                    placeholder="أضف ملاحظات..."
                                />
                            ) : (
                                <p className="text-gray-500 text-sm text-right min-h-[40px]">{order.notes || "لا توجد"}</p>
                            )}
                        </div>

                        {/* Customer Details Card */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-bold text-gray-900 mb-6 text-right border-b pb-2">بيانات الزبون</h3>
                            <div className="space-y-4 text-right">
                                <div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded text-right"
                                            value={editedOrder.customerName}
                                            onChange={(e) => setEditedOrder({ ...editedOrder, customerName: e.target.value })}
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900 text-lg">{order.customerName}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2 text-gray-600">
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            className="w-full p-2 border rounded text-right"
                                            value={editedOrder.customerPhone}
                                            onChange={(e) => setEditedOrder({ ...editedOrder, customerPhone: e.target.value })}
                                        />
                                    ) : (
                                        <span dir="ltr">{order.customerPhone}</span>
                                    )}
                                    <Phone className="h-4 w-4" />
                                </div>

                                <div className="flex items-center justify-end gap-2 text-gray-600">
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            className="w-full p-2 border rounded text-right"
                                            value={editedOrder.customerEmail}
                                            onChange={(e) => setEditedOrder({ ...editedOrder, customerEmail: e.target.value })}
                                        />
                                    ) : (
                                        <span className="truncate max-w-[200px]">{order.customerEmail || '-'}</span>
                                    )}
                                    <Mail className="h-4 w-4" />
                                </div>

                                <div className="flex items-start justify-end gap-2 text-gray-600 border-t pt-4 mt-2">
                                    <div className="flex-1 text-right">
                                        {isEditing ? (
                                            <textarea
                                                className="w-full p-2 border rounded text-right"
                                                value={editedOrder.customerAddress}
                                                onChange={(e) => setEditedOrder({ ...editedOrder, customerAddress: e.target.value })}
                                            />
                                        ) : (
                                            <>
                                                <p className="font-medium text-gray-900">{cities.data?.find((c) => c.id === (order as any).cityId)?.name || "غير محدد"}</p>
                                                <p className="text-sm">{order.customerAddress}</p>
                                            </>
                                        )}
                                    </div>
                                    <MapPin className="h-4 w-4 mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Cancel Button (Sticky or placed at bottom) */}
                        {order.status !== 'cancelled' && (
                            <button
                                onClick={() => handleStatusUpdate('cancelled')}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="h-5 w-5" />
                                إلغاء الطلب
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- INVOICE PRINT LAYOUT --- */}
            <div className="hidden print:block w-full text-black bg-white p-8" dir="rtl">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 border-b-2 border-gray-100 pb-6">
                    <div className="text-right">
                        <h1 className="text-xl font-bold uppercase tracking-wider mb-2">SABO STORE</h1>
                        <p className="text-lg font-bold">رقم الفاتورة: {order.orderNumber}</p>
                    </div>
                    <div className="w-32">
                        <img src="/invoice-logo.png" alt="Sabo Store" className="w-full h-auto object-contain" />
                    </div>
                </div>

                <div className="flex flex-row justify-between items-start mb-8 gap-8">
                    {/* Left: Invoice Dates & Amounts */}
                    <div className="w-[40%] text-sm">
                        <div className="border border-gray-300">
                            <div className="flex border-b border-gray-300">
                                <div className="w-1/2 bg-gray-50 p-2 font-bold text-center border-l border-gray-300">تاريخ الفاتورة</div>
                                <div className="w-1/2 p-2 text-center text-gray-800">{new Date(order.createdAt).toLocaleDateString("en-GB")}</div>
                            </div>
                            <div className="flex">
                                <div className="w-1/2 bg-gray-50 p-2 font-bold text-center border-l border-gray-300">المبلغ المستحق</div>
                                <div className="w-1/2 p-2 text-center font-bold text-gray-800">{Number(order.totalAmount).toFixed(2)} د.ل</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Bill To */}
                    <div className="w-[50%] text-right">
                        <h3 className="font-bold text-lg mb-2 text-gray-900">فاتورة الى:</h3>
                        <div className="text-gray-800 space-y-1">
                            <p className="font-bold text-base">{order.customerName}</p>
                            <p dir="ltr" className="text-right">{order.customerPhone}</p>
                            <p className="text-gray-600">{order.customerAddress || 'عنوان غير محدد'}</p>
                            <p className="mt-2 font-bold text-black border-t pt-1 inline-block">
                                {
                                    order.paymentMethod === 'cod' || order.paymentMethod === 'cash_on_delivery' || !order.paymentMethod ? 'نقدي' :
                                        order.paymentMethod === 'moamalat' ? 'بطاقة مصرفية' :
                                            order.paymentMethod === 'lypay' ? 'لي باي' :
                                                order.paymentMethod
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details Table */}
                <table className="w-full mb-8 border border-gray-200">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-sm">
                            <th className="p-3 text-center border-l w-[15%]">الاجمالي</th>
                            <th className="p-3 text-center border-l w-[15%]">سعر الوحدة</th>
                            <th className="p-3 text-center border-l w-[10%]">الكمية</th>
                            <th className="p-3 text-right w-[60%]">المنتج</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {order.items?.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="p-3 text-center border-l font-medium">{(item.price * item.quantity).toFixed(2)} د.ل</td>
                                <td className="p-3 text-center border-l">{item.price} د.ل</td>
                                <td className="p-3 text-center border-l">{item.quantity}</td>
                                <td className="p-3 text-right flex items-center justify-end gap-3">
                                    <span className="font-bold text-gray-800">{item.productName || item.name}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer: Totals & Notes */}
                <div className="flex justify-between items-start">
                    {/* Left: Totals */}
                    <div className="w-[35%] text-sm">
                        <div className="border border-gray-300">
                            <div className="flex border-b border-gray-300">
                                <div className="w-1/2 p-2 text-center text-gray-800">{Number(order.totalAmount).toFixed(2)} د.ل</div>
                                <div className="w-1/2 bg-gray-50 p-2 font-bold text-center border-l border-gray-300">المجموع الكلي</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Notes */}
                    <div className="w-[50%] text-right">
                        <h3 className="font-bold mb-2 text-gray-900 border-b pb-1 inline-block">ملاحظات</h3>
                        <p className="text-gray-600 text-sm mt-1">{order.notes || "لا يوجد ملاحظات"}</p>
                    </div>
                </div>
            </div>

            <style>{`
@media print {
    @page { size: A4; margin: 1cm; }
    body { background-color: white !important; font-size: 14pt; font-family: sans-serif; }
    .ml-64 { margin-left: 0 !important; padding: 0 !important; }
    .hidden.print\\:block { display: block !important; }
    .print\\:hidden, #sidebar, header, nav, footer, .admin-sidebar, .lucide, button, a { display: none !important; }

    /* Hide everything else */
    div[class*="min-h-screen"] > div[class*="ml-64"] > div:not(.print\\:block) {
        display: none !important;
    }
    div[class*="min-h-screen"] > div:first-child {
        display: none !important; /* Hide sidebar container */
    }

    /* Ensure invoice is visible and takes full width */
    .print\\:block {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        background: white;
    }
}
            `}</style>
            <ConfirmDialog />
        </div>
    );
}
