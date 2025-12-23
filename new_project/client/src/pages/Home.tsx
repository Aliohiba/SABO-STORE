import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingCart, Search, LogOut, LogIn, Home as HomeIcon, Package, Clock } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-1 md:gap-2 cursor-pointer">
              <img src="/logo.png" alt="SABO STORE" className="h-8 md:h-10" />
              <span className="text-sm md:text-xl font-bold text-blue-600">SABO</span>
            </div>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 mx-8 max-w-md">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                placeholder="بحث المنتجات"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
              <Search className="absolute right-3 text-gray-400 h-4 w-4" />
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/products">
              <Button variant="ghost" className="gap-1 md:gap-2 p-2 md:p-3">
                <Package className="h-4 md:h-5 w-4 md:w-5" />
                <span className="hidden md:inline text-sm">المتجر</span>
              </Button>
            </Link>

            <Link href="/cart">
              <Button variant="ghost" className="gap-1 md:gap-2 p-2 md:p-3">
                <ShoppingCart className="h-4 md:h-5 w-4 md:w-5" />
                <span className="hidden md:inline text-sm">السلة</span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/orders">
                  <Button variant="ghost" className="gap-1 md:gap-2 p-2 md:p-3">
                    <Clock className="h-4 md:h-5 w-4 md:w-5" />
                    <span className="hidden md:inline text-sm">الطلبات</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => logout()}
                  className="gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm"
                >
                  <LogOut className="h-4 md:h-5 w-4 md:w-5" />
                  <span className="hidden md:inline">تسجيل الخروج</span>
                </Button>
              </>
            ) : (
              <Link href="/admin/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
                  <LogIn className="h-4 md:h-5 w-4 md:w-5" />
                  <span className="hidden md:inline">تسجيل الدخول</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">مرحباً بك في SABO STORE</h1>
            <p className="text-sm md:text-lg mb-4 md:mb-6">اكتشف أفضل المنتجات بأسعار منافسة وجودة عالية</p>
            <Link href="/products">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-4 md:px-8 py-2 md:py-3 text-sm md:text-lg">
                تصفح المنتجات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-12 md:w-16 h-12 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <ShoppingCart className="h-6 md:h-8 w-6 md:w-8 text-blue-600" />
              </div>
              <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base">توصيل سريع</h3>
              <p className="text-gray-600 text-xs md:text-sm">توصيل سريع وآمن إلى باب منزلك</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 md:w-16 h-12 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <Package className="h-6 md:h-8 w-6 md:w-8 text-green-600" />
              </div>
              <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base">منتجات أصلية</h3>
              <p className="text-gray-600 text-xs md:text-sm">جميع منتجاتنا أصلية وموثوقة</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 md:w-16 h-12 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <ShoppingCart className="h-6 md:h-8 w-6 md:w-8 text-purple-600" />
              </div>
              <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base">ضمان</h3>
              <p className="text-gray-600 text-xs md:text-sm">ضمان كامل على جميع المنتجات</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-12 md:w-16 h-12 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <ShoppingCart className="h-6 md:h-8 w-6 md:w-8 text-orange-600" />
              </div>
              <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base">خدمة عملاء</h3>
              <p className="text-gray-600 text-xs md:text-sm">فريق دعم متاح 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 overflow-x-hidden">
        <div className="container mx-auto px-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 mb-8">
            <div className="min-w-0">
              <h4 className="font-bold mb-4 text-sm md:text-base">عن SABO STORE</h4>
              <p className="text-gray-400 text-xs md:text-sm">متجر إلكتروني متخصص في بيع المنتجات الأصلية بأسعار منافسة</p>
            </div>
            <div className="min-w-0">
              <h4 className="font-bold mb-4 text-sm md:text-base">الروابط السريعة</h4>
              <ul className="text-gray-400 text-xs md:text-sm space-y-2">
                <li><Link href="/products" className="hover:text-white">المنتجات</Link></li>
                <li><Link href="/cart" className="hover:text-white">السلة</Link></li>
                <li><Link href="/admin/login" className="hover:text-white">لوحة التحكم</Link></li>
              </ul>
            </div>
            <div className="min-w-0">
              <h4 className="font-bold mb-4 text-sm md:text-base">التواصل</h4>
              <p className="text-gray-400 text-xs md:text-sm">البريد الإلكتروني: info@sabostore.com</p>
              <p className="text-gray-400 text-xs md:text-sm">الهاتف: +218 9XXXXXXXX</p>
            </div>
            <div className="min-w-0">
              <h4 className="font-bold mb-4 text-sm md:text-base">الدفع</h4>
              <p className="text-gray-400 text-xs md:text-sm">الدفع عند الاستلام (كاش)</p>
              <p className="text-gray-400 text-xs md:text-sm">طرق دفع آخرى قريباً</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 SABO STORE. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
