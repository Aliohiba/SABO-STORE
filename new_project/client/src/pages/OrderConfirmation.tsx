import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, Home } from "lucide-react";

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">SABO STORE</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          
          <h1 className="text-3xl font-bold mb-2">شكراً لك!</h1>
          <p className="text-gray-600 mb-6">تم استقبال طلبك بنجاح</p>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-1">رقم الطلب</p>
            <p className="text-2xl font-bold text-blue-600">#{orderId}</p>
          </div>

          <p className="text-gray-600 mb-6">
            سيتم التواصل معك قريباً لتأكيد الطلب. يمكنك تتبع حالة طلبك من خلال رقم الطلب أعلاه.
          </p>

          <div className="space-y-3">
            <Link href={`/track-order/${orderId}`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                تتبع الطلب
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full gap-2">
                <Home className="h-4 w-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
