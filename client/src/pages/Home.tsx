import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Package, ShoppingCart, Search, LogIn, Home as HomeIcon, Clock, LayoutDashboard, Settings, Truck, ShieldCheck, HeartHandshake, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import CustomerNavbar from "@/components/CustomerNavbar";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { guestCart } from "@/lib/guestCart";
import PageTransition from "@/components/PageTransition";
import LazyImage from "@/components/LazyImage";
import { motion } from "framer-motion";
import OfferCountdown from "@/components/OfferCountdown";

export default function Home() {
  const { t } = useTranslation();
  // Use customer.me instead of useAuth
  const customerQuery = trpc.customer.me.useQuery();
  const logoutMutation = trpc.customer.logout.useMutation();
  const addToCart = trpc.cart.add.useMutation();
  const [, setLocation] = useLocation();

  const customer = customerQuery.data;
  const isAuthenticated = Boolean(customer);
  const isLoggedIn = Boolean(customer);

  const [searchQuery, setSearchQuery] = useState("");

  const { data: settings } = trpc.storeSettings.get.useQuery();

  const allProductIds = settings?.featuredSections?.flatMap((section: any) =>
    section.products?.map((p: any) => String(p)) || []
  ) || [];

  const { data: featuredProducts } = trpc.products.getByIds.useQuery(
    { ids: allProductIds },
    { enabled: allProductIds.length > 0 }
  );

  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: flashDeals } = trpc.products.list.useQuery({ showActiveOffer: true, limit: 10 });
  const carouselRef = useRef<HTMLDivElement>(null);

  // Ensure we have enough items for a smooth loop even on large screens
  // We want the base set to be at least ~10 items to cover wide viewports
  let baseCategories = [...categories];
  // Repeat list until we have at least 15 items to ensure it covers even large screens
  if (categories.length > 0) {
    while (baseCategories.length < 15) {
      baseCategories = [...baseCategories, ...categories];
    }
  }

  // Double the list for seamless infinite scroll (A + A)
  // We will animate from 0% to -50% of the total width
  const loopedCategories = categories.length > 0 ? [...baseCategories, ...baseCategories] : [];

  // Debug: Log categories
  console.log('📦 Original Categories:', categories.length);
  console.log('📦 Base Set Size:', baseCategories.length);
  console.log('📦 Total Carousel Items:', loopedCategories.length);

  // Manual scroll (nudging the position) - simpler implementation for marquee
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    // For an infinite CSS marquee, manual scrolling is tricky. 
    // We can just bump the scrollLeft, but the CSS animation dominates.
    // For now, simpler to rely on the clean infinite loop requested.
    // If buttons are strictly needed they might conflicts, but let's try to support them via scrollLeft override
    if (scrollRef.current) {
      const Amount = 300;
      scrollRef.current.scrollBy({ left: direction === 'right' ? Amount : -Amount, behavior: 'smooth' });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background overflow-x-hidden transition-colors duration-300">
        {/* Navigation Bar */}
        <CustomerNavbar showSearch={true} />

        {/* Hero Section */}
        <HeroBanner />

        {/* Flash Deals Section (Special Offers) */}
        {flashDeals && flashDeals.length > 0 && (
          <section className="py-16 bg-muted/30 relative overflow-hidden transition-colors duration-300">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 opacity-50 translate-x-[20%] translate-y-[-20%]"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 opacity-50 translate-x-[-20%] translate-y-[20%]"></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div className="text-center md:text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 mb-3">
                    <Clock className="w-4 h-4 text-destructive animate-pulse" />
                    <span className="text-destructive font-bold tracking-wide text-xs uppercase">Limited Time Offers</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-2 leading-tight">عروض حصرية</h2>
                  <p className="text-muted-foreground text-lg">اغتنم الفرصة قبل انتهاء الوقت ونفاد الكمية!</p>
                </div>
                <Link href="/products?showActiveOffer=true">
                  <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive transition-all rounded-full px-8 h-12">
                    مشاهدة جميع العروض
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {flashDeals.map((product: any, index: number) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border group flex flex-col relative"
                  >
                    {/* Floating Countdown */}
                    {product.offerEndTime && (
                      <div className="absolute top-3 left-3 z-20">
                        <div className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-border">
                          <Clock className="w-3 h-3 text-destructive" />
                          <OfferCountdown endTime={product.offerEndTime} compact={true} />
                        </div>
                      </div>
                    )}

                    {/* Image Area */}
                    <div className="relative overflow-hidden aspect-[4/3] bg-muted">
                      {product.image ? (
                        <LazyImage
                          src={product.image}
                          alt={product.name}
                          className="transform group-hover:scale-110 transition-transform duration-700 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-16 h-16 opacity-50" />
                        </div>
                      )}

                      {/* Top Right Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                        {product.originalPrice && product.price < product.originalPrice && (
                          <div className="bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded-lg shadow-lg">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </div>
                        )}
                      </div>

                      {/* Action Buttons Overlay */}
                      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3 translate-y-20 group-hover:translate-y-0 transition-transform duration-300 z-20 px-4">
                        <Link href={`/products/${product._id}`} className="w-full">
                          <Button className="w-full bg-card text-card-foreground hover:bg-muted shadow-md border border-border font-bold rounded-xl h-10">
                            <Search className="w-4 h-4 mr-2" />
                            تفاصيل
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex flex-col flex-grow relative bg-card">
                      <div className="flex-grow">
                        <Link href={`/products/${product._id}`}>
                          <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Price Block */}
                        <div className="flex items-end gap-2 mb-4">
                          <span className="font-black text-2xl text-primary">
                            <span className="text-sm font-normal text-muted-foreground mr-1">د.ل</span>
                            {product.price}
                          </span>
                          {product.originalPrice && product.price < product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through mb-1">
                              {product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stock Progress Bar (Fake or Real) */}
                      <div className="mt-auto pt-4 border-t border-border">
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="text-destructive">🔥 أوشك على الانتهاء</span>
                          <span className="text-muted-foreground">{t('product.only_left_1', 'باقي')} {product.stock || 5}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(15, 100 - ((product.stock || 10) * 5)))}%` }} // Dynamic width simulation
                          ></div>
                        </div>

                        <Button
                          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-xl shadow-md hover:shadow-lg"
                          onClick={(e) => {
                            e.preventDefault();
                            const pid = product._id;
                            if (isLoggedIn) {
                              addToCart.mutate(
                                { productId: pid, quantity: 1 },
                                { onSuccess: () => toast.success(t('home_page.added_to_cart')) }
                              );
                            } else {
                              const current = guestCart.getProductQuantity(pid);
                              if (current + 1 > (product.stock || 0)) {
                                toast.error(t('cart.stock_limit_exceeded'));
                                return;
                              }
                              guestCart.addItem(pid, 1);
                              toast.success(t('home_page.added_to_cart'));
                            }
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {t('common.add_to_cart')}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories Section with CSS Infinite Scroll */}
        {categories.length > 0 && (
          <section className="py-10 bg-card overflow-hidden transition-colors duration-300">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">التصنيفات</h2>

              <div className="relative group/carousel max-w-[100vw] overflow-hidden" dir="ltr">
                {/* Scroll controls - hidden by default, visible on hover if someone really wants to click, but mainly for visual balance */}
                <button
                  onClick={() => scrollCarousel('right')}
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur hover:bg-background shadow-lg rounded-full p-3 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 border border-border"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-6 h-6 text-foreground" />
                </button>

                <button
                  onClick={() => scrollCarousel('left')}
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur hover:bg-background shadow-lg rounded-full p-3 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 border border-border"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>

                <style>{`
                  @keyframes scroll-linear {
                    0% {
                      transform: translateX(0);
                    }
                    100% {
                      transform: translateX(-50%);
                    }
                  }
                  
                  .animate-scroll-linear {
                    animation: scroll-linear ${Math.max(25, baseCategories.length * 3)}s linear infinite;
                    width: max-content;
                  }
                  
                  .animate-scroll-linear:hover {
                    animation-play-state: paused;
                  }
                `}</style>

                {/* 
                  IMPORTANT: No gap in parent flex. 
                  Use Margin Right on items. 
                  This ensures 50% translation is EXACTLY half the width.
                */}
                <div
                  ref={scrollRef}
                  className="flex animate-scroll-linear"
                >
                  {loopedCategories.map((category: any, index: number) => (
                    <div
                      key={`${category.id || category._id}-${index}`}
                      className="mr-6 last:mr-0 inline-block"
                    >
                      <Link
                        href={`/products?search=&category=${category.id || category._id}`}
                        dir="rtl"
                      >
                        <div className="group cursor-pointer relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[280px] md:min-w-[350px] h-48 md:h-56">
                          {/* Image Background */}
                          {category.image ? (
                            <LazyImage
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                              <Package className="w-14 h-14 md:w-16 md:h-16 opacity-50" />
                            </div>
                          )}

                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-75 group-hover:opacity-85 transition-opacity"></div>

                          {/* Text Centered */}
                          {!settings?.hideCategoryNames && (
                            <div className="absolute inset-0 flex items-center justify-center p-5">
                              <span className="text-white text-2xl md:text-3xl font-bold text-center drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                                {category.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Featured Sections */}
        {settings?.featuredSections?.map((section: any, index: number) => {
          const sectionProducts = featuredProducts?.filter((p: any) =>
            section.products?.some((id: any) => String(id) === String(p._id || p.id))
          ) || [];

          if (sectionProducts.length === 0) return null;

          return (
            <section key={section._id || index} className="py-12 bg-muted/20 transition-colors duration-300">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8 px-2">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{section.title}</h2>
                    <div className="h-1 w-20 bg-primary rounded-full"></div>
                  </div>
                  <Link href="/products">
                    <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                      {t('home_page.view_more')}
                    </Button>
                  </Link>
                </div>

                <div className="flex overflow-x-auto pb-6 gap-6 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                  {sectionProducts.map((product: any, index: number) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="min-w-[280px] max-w-[280px] bg-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border group snap-center flex flex-col"
                    >
                      <div className="relative overflow-hidden rounded-t-2xl">
                        {product.image ? (
                          <LazyImage
                            src={product.image}
                            alt={product.name}
                            className="transform group-hover:scale-110 transition-transform duration-500"
                            aspectRatio="4/3"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="w-12 h-12 opacity-20" />
                          </div>
                        )}

                        {/* Badge if Discounted */}
                        {product.originalPrice && product.price < product.originalPrice && (
                          <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            {t('product.discount')} {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </div>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2 justify-center bg-gradient-to-t from-black/50 to-transparent pt-10">
                          <Link href={`/products/${product._id}`}>
                            <Button size="sm" className="bg-card text-card-foreground hover:bg-muted rounded-full shadow-lg h-9 w-9 p-0">
                              <Search className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-grow">
                        <div className="mb-2">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                            {product.category?.name || t('product.general')}
                          </span>
                        </div>
                        <Link href={`/products/${product._id}`}>
                          <h3 className="font-bold text-foreground mb-1 line-clamp-2 hover:text-primary transition-colors h-12">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border">
                          <div className="flex flex-col">
                            {product.originalPrice && product.price < product.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through">
                                <span className="mr-1">د.ل</span>
                                {product.originalPrice}
                              </span>
                            )}
                            <span className="font-bold text-lg text-primary">
                              <span className="text-sm font-normal text-muted-foreground mr-1">د.ل</span>
                              {product.price}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 font-bold shadow-sm transition-all"
                              onClick={(e) => {
                                e.preventDefault();
                                const pid = product._id;
                                if (isLoggedIn) {
                                  addToCart.mutate(
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
                            >
                              {t('common.buy_now')}
                            </Button>
                            <Button
                              size="sm"
                              className="rounded-full bg-primary hover:bg-primary/80 text-primary-foreground transition-colors shadow-md w-8 h-8 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                const pid = product._id;
                                if (isLoggedIn) {
                                  addToCart.mutate(
                                    { productId: pid, quantity: 1 },
                                    { onSuccess: () => toast.success(t('home_page.added_to_cart')) }
                                  );
                                } else {
                                  const current = guestCart.getProductQuantity(pid);
                                  if (current + 1 > product.stock) {
                                    toast.error(t('cart.stock_limit_exceeded'));
                                    return;
                                  }
                                  guestCart.addItem(pid, 1);
                                  toast.success(t('home_page.added_to_cart'));
                                }
                              }}
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* Features Section */}
        <section className="py-12 md:py-16 bg-card relative overflow-hidden transition-colors duration-300">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 opacity-50 translate-x-[-50%] translate-y-[-50%]"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 opacity-50 translate-x-[50%] translate-y-[50%]"></div>

          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">

              {/* Feature 1 */}
              <div className="group p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">{t('home_page.fast_delivery_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('home_page.fast_delivery_desc')}</p>
              </div>

              {/* Feature 2 */}
              <div className="group p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">{t('home_page.authentic_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('home_page.authentic_desc')}</p>
              </div>

              {/* Feature 3 */}
              <div className="group p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">{t('home_page.warranty_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('home_page.warranty_desc')}</p>
              </div>

              {/* Feature 4 */}
              <div className="group p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <HeartHandshake className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">{t('home_page.customer_support_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('home_page.customer_support_desc')}</p>
              </div>

            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </PageTransition>
  );
}
