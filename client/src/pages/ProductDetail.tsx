import { useParams, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ChevronLeft, Package, Check, AlertCircle, Clock, Play } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import CustomerNavbar from "@/components/CustomerNavbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { guestCart } from "@/lib/guestCart";

import OfferCountdown from "@/components/OfferCountdown";

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: product, isLoading } = trpc.products.getById.useQuery({ id: id || "" });
  const { data: customer } = trpc.customer.me.useQuery();
  const isLoggedIn = !!customer;
  const addToCart = trpc.cart.add.useMutation();

  // Set initial selected image when product loads
  useEffect(() => {
    if (product?.image) {
      setSelectedImage(product.image);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!id) return;
    if (isLoggedIn) {
      addToCart.mutate(
        { productId: id, quantity },
        {
          onSuccess: () => {
            toast.success(t('cart.added_success') || "Added to cart successfully");
            setLocation("/cart");
          },
        }
      );
    } else {
      // Guest Logic with Stock Validation
      const currentInCart = guestCart.getProductQuantity(id);
      const newTotal = currentInCart + quantity;

      if (product && newTotal > product.stock) {
        toast.error(`${t('cart.stock_limit_exceeded')} (${t('common.available')}: ${Math.max(0, product.stock - currentInCart)})`);
        return;
      }

      guestCart.addItem(id, quantity);
      toast.success(t('cart.added_success') || "Added to cart successfully");
      setLocation("/cart");
    }
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Determine images to show
  const images = product.images && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  // Determine current image to display (fallback to main if selected is empty)
  const displayImage = selectedImage || product.image;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden relative">
      <CustomerNavbar showSearch={false} />

      {/* Decorative Background Elements (Similar to Home) */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10"></div>
      <div className="absolute top-20 left-0 w-72 h-72 bg-primary/20 rounded-full blur-[100px] -z-10 opacity-30 translate-x-[-20%]"></div>
      <div className="absolute top-40 right-0 w-96 h-96 bg-purple-100 rounded-full blur-[100px] -z-10 opacity-30 translate-x-[20%]"></div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb / Back Button */}
        <div className="mb-6">
          <Link href="/">
            <button className="flex items-center text-gray-500 hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4 ml-1" />
              {t('product.back_home')}
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">

            {/* Right Column: Image Gallery */}
            <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col items-center">
              <div className="relative w-full aspect-square md:aspect-[4/3] bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden flex items-center justify-center group">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Package className="w-20 h-20 text-gray-300" />
                )}

                {/* Discount Badge */}
                {product.originalPrice && product.price < product.originalPrice && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
                    {t('product.discount')} {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 w-full px-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative min-w-[80px] w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${displayImage === img
                        ? "border-primary ring-2 ring-primary/20 ring-offset-2"
                        : "border-transparent ring-1 ring-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Video Lazy Load */}
              {product.video && (
                <div className="mt-6 w-full">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    فيديو المنتج
                  </h3>
                  <div
                    className={`relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 ${!isPlaying ? "cursor-pointer group hover:shadow-md transition-all" : ""}`}
                    onClick={() => !isPlaying && setIsPlaying(true)}
                  >
                    {!isPlaying ? (
                      <>
                        {/* Thumbnail Logic */}
                        {(product.video.includes("youtube.com") || product.video.includes("youtu.be")) ? (
                          <img
                            src={`https://img.youtube.com/vi/${product.video.includes("watch?v=")
                              ? product.video.split("watch?v=")[1].split("&")[0]
                              : product.video.split("youtu.be/")[1]?.split("?")[0] || ""
                              }/hqdefault.jpg`}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition-opacity"
                            alt="Video thumbnail"
                          />
                        ) : (
                          // Default gradient/placeholder for uploaded/vimeo videos
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                            <Play className="w-12 h-12 text-white/20" />
                          </div>
                        )}

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center pl-1 shadow-lg text-primary">
                              <Play className="w-5 h-5 fill-current" />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Player Content
                      <div className="w-full h-full animate-in fade-in duration-300">
                        {(() => {
                          const videoEx = product.video || "";
                          if (videoEx.includes("youtube.com") || videoEx.includes("youtu.be")) {
                            let embedId = "";
                            if (videoEx.includes("watch?v=")) embedId = videoEx.split("watch?v=")[1].split("&")[0];
                            else if (videoEx.includes("youtu.be/")) embedId = videoEx.split("youtu.be/")[1].split("?")[0];

                            if (embedId) {
                              return <iframe
                                src={`https://www.youtube.com/embed/${embedId}?autoplay=1`}
                                className="w-full h-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              ></iframe>;
                            }
                          }
                          if (videoEx.includes("vimeo.com")) {
                            const videoId = videoEx.split('/').pop();
                            return <iframe src={`https://player.vimeo.com/video/${videoId}?autoplay=1`} className="w-full h-full" allowFullScreen></iframe>;
                          }
                          return <video controls autoPlay src={videoEx} className="w-full h-full" />;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Left Column: Product Details */}
            <div className="p-6 md:p-10 flex flex-col">
              <div className="mb-auto">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {product.categoryId ? t('product.featured') : t('product.general')}
                    {/* Note: In a real app we'd fetch the category name or pass it included */}
                  </span>
                  {product.status === "available" && product.stock > 0 && (
                    <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                      <Check className="w-3 h-3" /> {t('common.available')}
                    </span>
                  )}
                  {(product.status === "unavailable" || product.stock <= 0) && (
                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                      <AlertCircle className="w-3 h-3" /> {t('common.unavailable')}
                    </span>
                  )}
                  {product.status === "coming_soon" && (
                    <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-sm font-medium">
                      <Clock className="w-3 h-3" /> {t('common.coming_soon')}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-end gap-3 mb-8 border-b border-gray-100 pb-8">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">{t('product.price')}</span>
                    <span className="text-4xl font-bold text-primary">
                      <span className="text-xl font-normal text-gray-400">د.ل</span> {product.price}
                    </span>
                  </div>
                  {product.originalPrice && product.price < product.originalPrice && (
                    <div className="flex flex-col mb-1 text-gray-400">
                      <span className="text-xs">{t('product.instead_of')}</span>
                      <span className="text-xl line-through decoration-red-400/50">
                        د.ل {product.originalPrice}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">{t('product.details')}</h3>
                  <div
                    className="prose prose-sm md:prose-base text-gray-600 max-w-none prose-p:leading-relaxed prose-headings:text-gray-900 prose-a:text-primary"
                    dangerouslySetInnerHTML={{ __html: product.description || "" }}
                  />
                  {!product.description && <p className="text-gray-400 italic">{t('product.no_description')}</p>}
                </div>

                {/* Tags / Specs */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">{t('product.specs')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors border border-gray-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scarcity & Urgency Alerts */}
                <div className="space-y-3 mb-6">
                  {/* Low Stock Alert */}
                  {product.stock > 0 && product.stock <= (product.lowStockThreshold || 5) && (
                    <div className="flex items-center gap-2 text-orange-700 bg-orange-50 border border-orange-100 p-3 rounded-lg animate-pulse">
                      <Clock className="w-5 h-5" />
                      <span className="font-bold">
                        {t('product.only_left_1', 'باقي')} {product.stock} {t('product.only_left_2', 'قطع فقط - اطلب قبل نفاد الكمية!')}
                      </span>
                    </div>
                  )}

                  {/* Offer Countdown */}
                  {product.offerEndTime && new Date(product.offerEndTime) > new Date() && (
                    <OfferCountdown endTime={product.offerEndTime} />
                  )}
                </div>
              </div>

              {/* Add to Cart Section - Sticky on Mobile could be added here, currently just static */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                {product.status !== "coming_soon" ? (
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 w-full md:w-auto overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-3 hover:bg-gray-200 transition-colors text-gray-600"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="text-lg font-bold w-12 text-center text-gray-800">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-3 hover:bg-gray-200 transition-colors text-gray-600"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full">
                      <Button
                        onClick={() => {
                          if (!id) return;
                          if (isLoggedIn) {
                            addToCart.mutate(
                              { productId: id, quantity },
                              { onSuccess: () => setLocation("/checkout") }
                            );
                          } else {
                            guestCart.addItem(id, quantity);
                            setLocation("/checkout");
                          }
                        }}
                        variant="outline"
                        disabled={(product.status !== "available" && product.status !== "displayed") || product.stock <= 0}
                        className="flex-1 border-2 border-primary text-primary hover:bg-primary/10 rounded-xl py-6 text-lg shadow-sm hover:shadow-primary/20 transition-all font-bold"
                      >
                        <ShoppingCart className="h-5 w-5 ml-2" />
                        {t('common.buy_now')}
                      </Button>

                      <Button
                        onClick={handleAddToCart}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 text-lg shadow-lg hover:shadow-primary/30 transition-all transform active:scale-[0.98]"
                      >
                        <Package className="h-5 w-5 ml-2" />
                        {t('common.add_to_cart')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-500 font-medium">
                    {t('product.unavailable_msg')}
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <div className="bg-white p-2 rounded-full shadow-sm text-primary">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{t('product.fast_shipping')}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg">
                  <div className="bg-white p-2 rounded-full shadow-sm text-green-600">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{t('product.secure_packaging')}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
