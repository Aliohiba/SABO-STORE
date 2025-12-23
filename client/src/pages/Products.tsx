import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingCart, Search, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const addToCart = trpc.cart.add.useMutation();

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const price = parseFloat(product.price);
    const matchesPrice = price >= priceRange.min && price <= priceRange.max;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const handleAddToCart = (productId: number) => {
    addToCart.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          toast.success("تم إضافة المنتج إلى السلة");
        },
        onError: () => {
          toast.error("فشل إضافة المنتج إلى السلة");
        },
      }
    );
  };

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
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/cart">
              <Button variant="ghost" className="gap-1 md:gap-2 p-2 md:p-3">
                <ShoppingCart className="h-4 md:h-5 w-4 md:w-5" />
                <span className="hidden md:inline text-sm">السلة</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">المنتجات</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 md:p-6 sticky top-20 md:top-4">
              <h3 className="font-bold text-lg mb-4">التصفية</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-xs md:text-sm font-medium mb-2">البحث</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  />
                  <Search className="absolute right-3 top-2.5 text-gray-400 h-4 w-4" />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">الفئات</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`block w-full text-right px-3 py-2 rounded-lg transition ${
                      selectedCategory === null
                        ? "bg-blue-100 text-blue-600 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    جميع الفئات
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`block w-full text-right px-3 py-2 rounded-lg transition ${
                        selectedCategory === category.id
                          ? "bg-blue-100 text-blue-600 font-medium"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-3">نطاق السعر</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="السعر الأدنى"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="السعر الأعلى"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">لا توجد منتجات تطابق البحث</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                    <Link href={`/products/${product.id}`}>
                      <div className="relative bg-gray-200 h-48 overflow-hidden cursor-pointer">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition"
                          />
                        )}
                        {product.status === "coming_soon" && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">Coming Soon</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-bold text-lg mb-2 cursor-pointer hover:text-blue-600 line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-blue-600">
                            {parseFloat(product.price).toFixed(2)} دينار
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {parseFloat(product.originalPrice).toFixed(2)} دينار
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        {product.status === "available" && (
                          <span className="text-sm text-green-600 font-medium">متوفر</span>
                        )}
                        {product.status === "unavailable" && (
                          <span className="text-sm text-red-600 font-medium">غير متوفر</span>
                        )}
                        {product.status === "coming_soon" && (
                          <span className="text-sm text-orange-600 font-medium">يتوفر قريباً</span>
                        )}
                      </div>

                      {product.tags && product.tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {product.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <Button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.status !== "available"}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        إضافة إلى السلة
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
