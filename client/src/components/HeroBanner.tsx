import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function HeroBanner() {
    const { t } = useTranslation();
    const { data: settings, isLoading } = trpc.storeSettings.get.useQuery();
    const [currentSlide, setCurrentSlide] = useState(0);

    const banners = settings?.banners || [];
    const hasBanners = banners.length > 0;

    useEffect(() => {
        if (!hasBanners) return;
        console.log(`[HeroBanner] Auto-sliding enabled for ${banners.length} banners.`);
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 5000); // تغيير كل 5 ثواني
        return () => clearInterval(interval);
    }, [hasBanners, banners.length]);

    if (isLoading) {
        return (
            <div className="w-full aspect-[1920/835] max-h-[85vh] bg-muted animate-pulse"></div>
        );
    }

    const nextSlide = () => {
        const next = (currentSlide + 1) % banners.length;
        console.log(`[HeroBanner] Manual Next: ${currentSlide} -> ${next}`);
        setCurrentSlide(next);
    };

    const prevSlide = () => {
        const prev = (currentSlide - 1 + banners.length) % banners.length;
        console.log(`[HeroBanner] Manual Prev: ${currentSlide} -> ${prev}`);
        setCurrentSlide(prev);
    };

    if (hasBanners) {
        return (
            <div className="relative w-full aspect-[1920/835] max-h-[85vh] overflow-hidden bg-background group">
                {/* Slides */}
                {banners.map((banner, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide
                            ? "opacity-100 z-10 pointer-events-auto"
                            : "opacity-0 z-0 pointer-events-none"
                            }`}
                    >
                        <img
                            src={banner}
                            alt={`Banner ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay Gradient (Optional for text readability if needed) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </div>
                ))}

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors z-20"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors z-10"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>

                {/* Call to Action Button - Glassmorphism Style */}
                <div className="absolute bottom-12 md:bottom-20 left-8 md:left-20 z-20">
                    <Link href="/products">
                        <button className="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 md:px-10 md:py-4 rounded-full font-bold text-base md:text-lg shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:border-white/40 flex items-center gap-3">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="relative z-10 tracking-wide">{t('cart.browse_products')}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="relative z-10 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-[-4px] transition-transform duration-300"
                            >
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>
                        </button>
                    </Link>
                </div>

                {/* Dots Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentSlide ? "bg-white w-6" : "bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Default Hero if no banners
    return (
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8 md:py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl">
                    <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                        {t('home_page.welcome_to')} {settings?.storeName || 'SABO STORE'}
                    </h1>
                    <p className="text-sm md:text-lg mb-4 md:mb-6">
                        {settings?.storeDescription || t('home_page.default_desc')}
                    </p>
                    <Link href="/products">
                        <Button className="bg-card text-card-foreground hover:bg-muted px-4 md:px-8 py-2 md:py-3 text-sm md:text-lg shadow-lg hover:shadow-xl transition-all">
                            {t('cart.browse_products')}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
