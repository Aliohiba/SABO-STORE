import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { data: cartItems = [] } = trpc.cart.list.useQuery();
  const createOrder = trpc.orders.create.useMutation();

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product ? parseFloat(item.product.price) : 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 0 ? 5 : 0;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone || !formData.customerAddress) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const items = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product?.price || "0",
      productName: item.product?.name || "",
    }));

    createOrder.mutate(
      {
        ...formData,
        items,
        totalAmount: total.toString(),
        paymentMethod: "cash_on_delivery",
      },
      {
        onSuccess: (result: any) => {
          toast.success("تم إنشاء الطلب بنجاح");
          const orderId = (result as any).insertId || 1;
          setLocation(`/order-confirmation/${orderId}`);
        },
        onError: () => {
          toast.error("فشل إنشاء الطلب");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">SABO STORE</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold mb-6">معلومات التسليم</h2>

              <div>
                <label className="block text-sm font-medium mb-2">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">العنوان *</label>
                <textarea
                  required
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-6">
                <h3 className="font-bold mb-2">طريقة الدفع</h3>
                <div className="flex items-center gap-3">
                  <input type="radio" id="cod" name="payment" value="cash_on_delivery" defaultChecked />
                  <label htmlFor="cod" className="cursor-pointer">الدفع عند الاستلام (كاش)</label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={createOrder.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg mt-6"
              >
                {createOrder.isPending ? "جاري المعالجة..." : "تأكيد الطلب"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-4">
              <h2 className="font-bold text-lg mb-4">ملخص الطلب</h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product?.name} x{item.quantity}</span>
                    <span className="font-bold">
                      {(parseFloat(item.product?.price || "0") * item.quantity).toFixed(2)} دينار
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي</span>
                  <span className="font-bold">{subtotal.toFixed(2)} دينار</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التوصيل</span>
                  <span className="font-bold">{shipping.toFixed(2)} دينار</span>
                </div>
              </div>

              <div className="flex justify-between mb-4">
                <span className="font-bold text-lg">الإجمالي</span>
                <span className="font-bold text-lg text-blue-600">{total.toFixed(2)} دينار</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
