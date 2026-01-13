import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useSearch } from "wouter";
import { ShoppingCart, Search, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import CustomerNavbar from "@/components/CustomerNavbar";
import { useTranslation } from "react-i18next";
import { guestCart } from "@/lib/guestCart";
import PageTransition from "@/components/PageTransition";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";
import LazyImage from "@/components/LazyImage";
import { motion } from "framer-motion";
import OfferCountdown from "@/components/OfferCountdown";

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: string;
  originalPrice?: string;
  image?: string;
  categoryId?: string;
  status: string;
  stock: number;
  tags?: string[];
  description?: string;
  images?: string[];
  offerEndTime?: string | Date;
}

interface Category {
  id: number | string;
  _id?: string;
  name: string;
  image?: string;
}

export default function Products() {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const showActiveOfferParam = searchParams.get("showActiveOffer") === "true";

  const { data: productsData = [], isLoading } = trpc.products.list.useQuery(
    showActiveOfferParam ? { showActiveOffer: true, limit: 50 } : undefined
  );
  const { data: categoriesData = [] } = trpc.categories.list.useQuery();
  const { data: customer } = trpc.customer.me.useQuery();
  const isLoggedIn = !!customer;
  const addToCartMutation = trpc.cart.add.useMutation();

  const products = productsData as Product[];
  const categories = categoriesData as Category[];

  // Sync URL search params with state (Search & Category)
  useEffect(() => {
    const params = new URLSearchParams(searchString);

    // Sync Search
    const query = params.get("search");
    if (query !== null && query !== searchQuery) {
      setSearchQuery(query);
    }

    // Sync Category - allow string comparisons
    const categoryParam = params.get("category");
    if (categoryParam) {
      // If param exists, set it (as string naturally, which is fine for filtering)
      if (categoryParam !== String(selectedCategory)) {
        setSelectedCategory(categoryParam);
      }
    } else if (categoryParam === null && selectedCategory !== null) {
      // Only clear if we are strictly following URL as source of truth. 
      // However, often components mount with URL param, then user clears filter via button (which might not clear URL).
      // But 'wouter' useSearch updates on navigation. 
      // If user arrived via /products (no param), we want null. 
      // If user clicked filter button, URL didn't change, so this effect won't run/override (unless we depend on searchString which didn't change).
      // BUT if user hits back button, URL changes, we MUST sync.
      // So yes, strictly syncing is better UX for history navigation.
      // But wait, if I click filter button, URL doesn't update, searchString doesn't update, Effect doesn't run. State updates. Good.
      // If I click Browser Back, URL updates, searchString updates, Effect runs. State updates. Good.
      // What if I go from /products?category=1 to /products?
      if (window.location.pathname === '/products' && !categoryParam) {
        setSelectedCategory(null);
      }
    }
  }, [searchString]);

  const filteredProducts = products.filter((product) => {
    // 1. Category Filter
    const matchesCategory = !selectedCategory || String(product.categoryId) === String(selectedCategory);

    // 2. Search Filter
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. Status Filter
    let matchesStatus = true;
    if (statusFilter === "available") {
      matchesStatus = (product.status === "available" || product.status === "displayed") && product.stock > 0;
    } else if (statusFilter === "unavailable") {
      matchesStatus = product.status === "unavailable" || product.stock <= 0;
    } else if (statusFilter === "coming_soon") {
      matchesStatus = product.status === "coming_soon";
    }

    // 4. Price Filter
    const price = parseFloat(product.price);
    const matchesPrice = price >= priceRange.min && price <= priceRange.max;

    return matchesCategory && matchesSearch && matchesStatus && matchesPrice;
  });

  // Auto-redirect if only one result found for exact search
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const hasSearchParam = !!params.get("search");

    if (!isLoading && hasSearchParam && filteredProducts.length === 1) {
      const product = filteredProducts[0];
      setLocation(`/products/${product._id || product.id}`, { replace: true });
    }
  }, [filteredProducts, isLoading, searchString, setLocation]);

  const handleAddToCart = (productId: string) => {
    if (isLoggedIn) {
      // Logged-in user: use server cart
      addToCartMutation.mutate(
        { productId, quantity: 1 },
        {
          onSuccess: () => {
            toast.success(t('cart.added_success') || "Added to cart successfully");
          },
          onError: () => {
            toast.error("Failed to add to cart");
          },
        }
      );
    } else {
      // Guest: use local cart
      const product = products.find(p => (p._id || p.id) === productId);
      if (product) {
        const current = guestCart.getProductQuantity(productId);
        if (current + 1 > product.stock) {
          toast.error(t('cart.stock_limit_exceeded'));
          return;
        }
      }
      guestCart.addItem(productId, 1);
      toast.success(t('cart.added_success') || "Added to cart successfully");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <CustomerNavbar showSearch={false} />

        <div className="container mx-auto px-4 py-4 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">
            {showActiveOfferParam ? "العروض والخصومات" : t('common.products_title')}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-4 md:p-6 sticky top-20 md:top-4">
                <h3 className="font-bold text-lg mb-4">{t('common.filter')}</h3>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-xs md:text-sm font-medium mb-2">{t('nav.search')}</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('nav.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}
                    />
                    <Search className={`absolute ${i18n.dir() === 'rtl' ? 'left-3' : 'right-3'} top-2.5 text-gray-400 h-4 w-4`} />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">{t('common.categories')}</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`block w-full px-3 py-2 rounded-lg transition ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'} ${selectedCategory === null
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      {t('common.all')}
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category._id || category.id}
                        onClick={() => setSelectedCategory(category._id ? String(category._id) : category.id)}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'} ${String(selectedCategory) === String(category._id || category.id)
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-gray-100"
                          }`}
                      >
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-8 h-8 rounded-md object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <span className="truncate">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-3">{t('common.price_range')}</label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder={t('common.min_price')}
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}
                    />
                    <input
                      type="number"
                      placeholder={t('common.max_price')}
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 10000 })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-3">{t('common.product_status')}</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`block w-full px-3 py-2 rounded-lg transition ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'} ${statusFilter === "all"
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      {t('common.all')}
                    </button>
                    <button
                      onClick={() => setStatusFilter("available")}
                      className={`block w-full px-3 py-2 rounded-lg transition ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'} ${statusFilter === "available"
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      {t('common.available')}
                    </button>
                    <button
                      onClick={() => setStatusFilter("unavailable")}
                      className={`block w-full px-3 py-2 rounded-lg transition ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'} ${statusFilter === "unavailable"
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      {t('common.unavailable')}
                    </button>
                    <button
                      onClick={() => setStatusFilter("coming_soon")}
                      className={`block w-full px-3 py-2 rounded-lg transition ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'} ${statusFilter === "coming_soon"
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      {t('common.coming_soon')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <ProductGridSkeleton count={8} />
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">{t('common.no_products_found')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product._id || product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <Link href={`/products/${product._id || product.id}`}>
                        <div className="relative overflow-hidden cursor-pointer">
                          {/* Timer Badge */}
                          {product.offerEndTime && (
                            <div className="absolute top-2 left-2 z-10 shadow-md">
                              <OfferCountdown endTime={product.offerEndTime} compact={true} />
                            </div>
                          )}

                          {product.image && (
                            <LazyImage
                              src={product.image}
                              alt={product.name}
                              className="hover:scale-105 transition-transform duration-300"
                              aspectRatio="4/3"
                            />
                          )}
                          {product.status === "coming_soon" && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">{t('common.coming_soon')}</span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-4">
                        <Link href={`/products/${product._id || product.id}`}>
                          <h3 className="font-bold text-lg mb-2 cursor-pointer hover:text-primary line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-primary">
                              <span className="text-sm font-normal text-gray-400 mr-1">د.ل</span>
                              {parseFloat(product.price).toFixed(2)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                <span className="mr-1">د.ل</span>
                                {parseFloat(product.originalPrice).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          {(product.status === "available" || product.status === "displayed") && product.stock > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <span className="w-2 h-2 mr-1 bg-green-400 rounded-full"></span>
                              {t('common.available')}
                            </span>
                          )}
                          {(product.status === "unavailable" || product.stock <= 0) && (
                            <span className="text-sm text-red-600 font-bold">{t('common.unavailable')}</span>
                          )}
                          {product.status === "coming_soon" && (
                            <span className="text-sm text-orange-600 font-medium">{t('common.coming_soon')}</span>
                          )}
                        </div>

                        {product.tags && product.tags.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((tag: string, idx: number) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              const pid = product._id || product.id || "";
                              if (isLoggedIn) {
                                addToCartMutation.mutate(
                                  { productId: pid, quantity: 1 },
                                  { onSuccess: () => setLocation("/checkout") }
                                );
                              } else {
                                const current = guestCart.getProductQuantity(pid);
                                if (current + 1 > product.stock) {
                                  toast.error(t('cart.stock_limit_exceeded'));
                                  return;
                                }
                                guestCart.addItem(pid, 1);
                                setLocation("/checkout");
                              }
                            }}
                            disabled={(product.status !== "available" && product.status !== "displayed") || product.stock <= 0}
                            variant="outline"
                            className="flex-1 border-primary text-primary hover:bg-primary/10"
                          >
                            {t('common.buy_now')}
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(product._id || product.id || "")}
                            disabled={product.status === "coming_soon"}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-3"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
