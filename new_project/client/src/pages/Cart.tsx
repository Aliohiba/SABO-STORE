import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Cart() {
  const { data: cartItems = [], refetch } = trpc.cart.list.useQuery();
  const removeItem = trpc.cart.remove.useMutation();
  const updateQuantity = trpc.cart.updateQuantity.useMutation();

  const handleRemoveItem = (id: number) => {
    removeItem.mutate(
      { id },
      {
        onSuccess: () => {
          refetch();
          toast.success("تم حذف المنتج من السلة");
        },
      }
    );
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    updateQuantity.mutate(
      { id, quantity },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product ? parseFloat(item.product.price) : 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 0 ? 5 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-1 md:gap-2 cursor-pointer">
              <img src="/logo.png" alt="SABO STORE" className="h-8 md:h-10" />
              <span className="text-sm md:text-xl font-bold text-blue-600">SABO</span>
            </div>
          </Link>
          <Link href="/products">
            <Button variant="ghost" className="text-xs md:text-sm">العودة</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">سلة التسوق</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">سلتك فارغة</p>
                <Link href="/products">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    تصفح المنتجات
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-4 flex gap-4">
                    {item.product?.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{item.product?.name}</h3>
                      <p className="text-blue-600 font-bold mb-3">
                        {parseFloat(item.product?.price || "0").toFixed(2)} دينار
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded text-xs"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded text-xs"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 md:p-6 sticky top-20 md:top-4">
              <h2 className="font-bold text-lg mb-4">ملخص الطلب</h2>

              <div className="space-y-2 md:space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">المجموع الفرعي</span>
                  <span className="font-bold">{subtotal.toFixed(2)} دينار</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">التوصيل</span>
                  <span className="font-bold">{shipping.toFixed(2)} دينار</span>
                </div>
              </div>

              <div className="flex justify-between mb-4 md:mb-6">
                <span className="font-bold text-base md:text-lg">الإجمالي</span>
                <span className="font-bold text-base md:text-lg text-blue-600">{total.toFixed(2)} دينار</span>
              </div>

              <Link href={cartItems.length > 0 ? "/checkout" : "#"}>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={cartItems.length === 0}
                >
                  المتابعة للدفع
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="outline" className="w-full mt-2">
                  متابعة التسوق
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
