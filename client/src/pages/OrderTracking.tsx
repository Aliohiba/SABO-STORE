import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order } = trpc.orders.getById.useQuery({ id: parseInt(orderId || "0") });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case "confirmed":
        return <CheckCircle className="h-6 w-6 text-blue-600" />;
      case "shipped":
        return <Truck className="h-6 w-6 text-purple-600" />;
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      default:
        return <Package className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      shipped: "مشحون",
      delivered: "تم التسليم",
      cancelled: "ملغى",
    };
    return statusMap[status] || status;
  };

  if (!order) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">SABO STORE</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">تتبع الطلب</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">حالة الطلب</h2>
              
              <div className="flex items-center gap-4 mb-6">
                {getStatusIcon(order.status)}
                <div>
                  <p className="text-sm text-gray-600">الحالة الحالية</p>
                  <p className="text-2xl font-bold">{getStatusText(order.status)}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {["pending", "confirmed", "shipped", "delivered"].map((status, idx) => (
                  <div key={status} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          ["pending", "confirmed", "shipped", "delivered"].indexOf(order.status) >= idx
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      {idx < 3 && (
                        <div
                          className={`w-1 h-8 ${
                            ["pending", "confirmed", "shipped", "delivered"].indexOf(order.status) > idx
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="font-bold capitalize">{getStatusText(status)}</p>
                      <p className="text-sm text-gray-600">
                        {status === "pending" && "في انتظار التأكيد"}
                        {status === "confirmed" && "تم تأكيد الطلب"}
                        {status === "shipped" && "الطلب في الطريق"}
                        {status === "delivered" && "تم التسليم"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">تفاصيل الطلب</h2>

              <div className="space-y-3 pb-4 border-b border-gray-200 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الطلب</span>
                  <span className="font-bold">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ الطلب</span>
                  <span className="font-bold">{new Date(order.createdAt).toLocaleDateString("ar-LY")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">طريقة الدفع</span>
                  <span className="font-bold">الدفع عند الاستلام</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">الاسم</span>
                  <span className="font-bold">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">البريد الإلكتروني</span>
                  <span className="font-bold">{order.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الهاتف</span>
                  <span className="font-bold">{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">العنوان</span>
                  <span className="font-bold text-right">{order.customerAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-4">
              <h2 className="font-bold text-lg mb-4">ملخص الطلب</h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع</span>
                  <span className="font-bold">{parseFloat(order.totalAmount).toFixed(2)} دينار</span>
                </div>
              </div>

              <Link href="/">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
