import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingCart, ChevronLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const { data: product } = trpc.products.getById.useQuery({ id: parseInt(id || "0") });
  const addToCart = trpc.cart.add.useMutation();

  const handleAddToCart = () => {
    addToCart.mutate(
      { productId: parseInt(id || "0"), quantity },
      {
        onSuccess: () => {
          toast.success("تم إضافة المنتج إلى السلة");
          setLocation("/cart");
        },
      }
    );
  };

  if (!product) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/products">
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-5 w-5" />
              العودة
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-lg p-6">
            {product.image && (
              <img src={product.image} alt={product.name} className="w-full h-96 object-cover rounded-lg" />
            )}
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-blue-600">
                  {parseFloat(product.price).toFixed(2)} دينار
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {parseFloat(product.originalPrice).toFixed(2)} دينار
                  </span>
                )}
              </div>
              <div className="text-sm">
                {product.status === "available" && (
                  <span className="text-green-600 font-medium">متوفر</span>
                )}
                {product.status === "unavailable" && (
                  <span className="text-red-600 font-medium">غير متوفر</span>
                )}
                {product.status === "coming_soon" && (
                  <span className="text-orange-600 font-medium">يتوفر قريباً</span>
                )}
              </div>
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">الوصف</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">المواصفات</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.status === "available" && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">الكمية</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <Button
              onClick={handleAddToCart}
              disabled={product.status !== "available"}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              إضافة إلى السلة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
