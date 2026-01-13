import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    User,
    LogOut,
    Package,
    ShoppingCart,
    Search,
    LogIn,
    Clock,
    LayoutDashboard,
    Settings,
    Wallet,
    Moon,
    Sun,
} from "lucide-react";
import { useState, useEffect } from "react";
import { guestCart } from "@/lib/guestCart";
import { useTheme } from "@/contexts/ThemeContext";

interface CustomerNavbarProps {
    showSearch?: boolean;
}

export default function CustomerNavbar({ showSearch = false }: CustomerNavbarProps) {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const customerQuery = trpc.customer.me.useQuery();
    // Get wallet balance if authenticated
    const { data: walletData } = trpc.wallet.getWallet.useQuery(undefined, {
        enabled: !!customerQuery.data,
        refetchOnWindowFocus: true
    });

    const logoutMutation = trpc.customer.logout.useMutation();

    const customer = customerQuery.data;
    const isAuthenticated = Boolean(customer);

    const { data: settings } = trpc.storeSettings.get.useQuery();

    const [searchQuery, setSearchQuery] = useState("");

    // Check for admin session
    const adminQuery = trpc.admin.me.useQuery(undefined, {
        retry: false,
        refetchOnWindowFocus: false
    });
    const isAdmin = !!adminQuery.data;

    // Cart count for badge
    const { data: serverCart = [] } = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });
    const [cartCount, setCartCount] = useState(0);

    // Update cart count
    useEffect(() => {
        if (isAuthenticated) {
            // Logged in: count from server cart
            const count = serverCart.reduce((sum, item: any) => sum + (item.quantity || 0), 0);
            setCartCount(count);
        } else {
            // Guest: count from local cart
            setCartCount(guestCart.getItemCount());

            // Listen for storage changes (in case user opens multiple tabs)
            const handleStorageChange = () => {
                setCartCount(guestCart.getItemCount());
            };
            window.addEventListener('storage', handleStorageChange);

            // Also refresh every 500ms to catch changes in same tab
            const interval = setInterval(() => {
                setCartCount(guestCart.getItemCount());
            }, 500);

            return () => {
                window.removeEventListener('storage', handleStorageChange);
                clearInterval(interval);
            };
        }
    }, [isAuthenticated, serverCart]);

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("customerToken");
            window.location.reload();
        }
    };

    const [location, setLocation] = useLocation();
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch suggestions
    const { data: suggestions, isLoading: isSearching } = trpc.products.search.useQuery(
        { query: debouncedQuery, limit: 5 },
        { enabled: debouncedQuery.length > 1 }
    );

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        setShowSuggestions(false);
        setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <nav
            className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-background/60"
            style={{ backgroundColor: settings?.theme?.headerColor || undefined }}
        >
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/">
                    <div className="flex items-center gap-3 cursor-pointer group select-none">
                        {/* Logo Container with Glow */}
                        <div className="relative">
                            <div className="absolute -inset-2 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            {settings?.storeLogo ? (
                                <img
                                    src={settings.storeLogo}
                                    alt={settings.storeName || "SABO STORE"}
                                    className="relative h-9 md:h-11 w-auto object-contain transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110"
                                />
                            ) : (
                                <img
                                    src="/logo.png"
                                    alt="SABO STORE"
                                    className="relative h-9 md:h-11 w-auto transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110"
                                />
                            )}
                        </div>

                        {/* Text Styling */}
                        <div className="relative hidden xs:block">
                            <span className="text-xl md:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60 group-hover:from-primary/90 group-hover:via-primary/70 group-hover:to-primary/50 transition-all duration-300 drop-shadow-sm">
                                {settings?.storeName || "SABO"}
                            </span>
                            <div className="h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-500 absolute bottom-0 right-0 rounded-full opacity-50"></div>
                        </div>
                    </div>
                </Link>

                {/* Search Bar with Suggestions */}
                {showSearch && (
                    <div className="hidden md:flex flex-1 mx-8 max-w-lg relative z-50">
                        <div className="relative flex items-center w-full group">
                            <input
                                type="text"
                                placeholder="بحث في المنتجات..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full px-6 py-2.5 bg-muted border border-border rounded-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all duration-300 text-sm text-foreground shadow-sm hover:shadow-md placeholder:text-muted-foreground"
                            />
                            <div
                                onClick={handleSearch}
                                className="absolute right-2 p-1.5 bg-primary rounded-full text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                <Search className="h-4 w-4" />
                            </div>
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && searchQuery.length > 1 && (
                            <div
                                className="absolute top-12 left-0 right-0 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
                                onMouseLeave={() => setShowSuggestions(false)}
                            >
                                {isSearching ? (
                                    <div className="p-4 text-center text-muted-foreground text-sm">جاري البحث...</div>
                                ) : suggestions && suggestions.length > 0 ? (
                                    <ul>
                                        {suggestions.map((product: any) => (
                                            <li key={product._id} className="border-b border-border last:border-0">
                                                <Link href={`/products/${product._id}`}>
                                                    <div
                                                        className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                                        onClick={() => setShowSuggestions(false)}
                                                    >
                                                        <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                                            {product.image ? (
                                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package className="w-full h-full p-2 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 text-right">
                                                            <h4 className="text-sm font-medium text-foreground truncate">{product.name}</h4>
                                                            <p className="text-xs text-primary font-bold">{product.salePrice || product.price} د.ل</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                        <li
                                            className="p-3 text-center text-xs text-primary font-medium hover:bg-muted cursor-pointer border-t border-border"
                                            onClick={handleSearch}
                                        >
                                            عرض كل النتائج لـ "{searchQuery}"
                                        </li>
                                    </ul>
                                ) : searchQuery.length > 1 && !isSearching ? (
                                    <div className="p-4 text-center text-muted-foreground text-sm">لا توجد منتجات مطابقة</div>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}

                {/* Right Navigation */}
                <div className="flex items-center gap-3 md:gap-4">

                    {/* Theme & Language Controls */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </div>

                    <Link href="/products">
                        <Button variant="ghost" size="icon" className="group relative rounded-full w-10 h-10 md:w-11 md:h-11 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                            <Package className="h-5 w-5 md:h-6 md:w-6 stroke-[1.5]" />
                            <span className="sr-only">{t('nav.home')}</span>
                        </Button>
                    </Link>

                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="group relative rounded-full w-10 h-10 md:w-11 md:h-11 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                            <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 stroke-[1.5]" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                            <span className="sr-only">{t('nav.cart')}</span>
                        </Button>
                    </Link>

                    {/* Wallet Display - Authenticated Users */}
                    {isAuthenticated && (
                        <Link href="/my-orders?tab=wallet">
                            <div className="flex items-center gap-1.5 mx-1 bg-green-50/80 dark:bg-green-900/20 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-green-100 dark:border-green-800 shadow-sm transition-all hover:bg-green-100 dark:hover:bg-green-900/40 hover:scale-105 active:scale-95 cursor-pointer select-none group">
                                <Wallet className="h-4 w-4 text-green-600 dark:text-green-400 stroke-[2] group-hover:text-green-700" />
                                <span className="text-xs md:text-sm font-bold text-green-700 dark:text-green-400 tabular-nums flex items-center gap-1 group-hover:text-green-800">
                                    {walletData ? walletData.balance.toFixed(2) : "..."}
                                    <span className="text-[9px] md:text-[10px] font-normal">د.ل</span>
                                </span>
                            </div>
                        </Link>
                    )}

                    {/* Orders Icon - Only for authenticated customers */}
                    {isAuthenticated && (
                        <Link href="/my-orders">
                            <Button variant="ghost" size="icon" className="group relative rounded-full w-10 h-10 md:w-11 md:h-11 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                                <Clock className="h-5 w-5 md:h-6 md:w-6 stroke-[1.5]" />
                                <span className="sr-only">{t('nav.my_orders')}</span>
                            </Button>
                        </Link>
                    )}

                    {/* Admin Dashboard - Only for admins */}
                    {isAdmin && (
                        <Link href="/admin/dashboard">
                            <Button variant="ghost" size="icon" className="group relative rounded-full w-10 h-10 md:w-11 md:h-11 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                                <LayoutDashboard className="h-6 w-6 md:h-7 md:w-7 stroke-[1.5]" />
                                <span className="sr-only">{t('nav.dashboard')}</span>
                            </Button>
                        </Link>
                    )}

                    {isAuthenticated || isAdmin ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 md:w-11 md:h-11 bg-muted hover:bg-primary/10 hover:text-primary transition-all duration-300 border border-border shadow-sm">
                                    <User className="h-5 w-5 md:h-6 md:w-6 stroke-[1.5]" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-bold text-right">
                                    {customer?.name ? `مرحباً، ${customer.name}` : (isAdmin ? "مرحباً، المسؤول" : "مرحباً، زائر")}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {isAdmin && (
                                    <Link href="/admin/dashboard">
                                        <DropdownMenuItem className="cursor-pointer flex flex-row-reverse justify-start gap-2">
                                            <LayoutDashboard className="h-4 w-4" />
                                            <span>{t('nav.dashboard')}</span>
                                        </DropdownMenuItem>
                                    </Link>
                                )}

                                {customer && (
                                    <>
                                        <Link href="/my-orders">
                                            <DropdownMenuItem className="cursor-pointer flex flex-row-reverse justify-start gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>{t('nav.my_orders')}</span>
                                            </DropdownMenuItem>
                                        </Link>

                                        <Link href="/cart">
                                            <DropdownMenuItem className="cursor-pointer flex flex-row-reverse justify-start gap-2">
                                                <ShoppingCart className="h-4 w-4" />
                                                <span>{t('nav.cart')}</span>
                                            </DropdownMenuItem>
                                        </Link>
                                    </>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    className="cursor-pointer text-destructive focus:text-destructive flex flex-row-reverse justify-start gap-2"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>{t('nav.logout')}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login">
                            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 transform">
                                <LogIn className="h-4 md:h-5 w-4 md:w-5" />
                                <span className="hidden md:inline">{t('nav.login')}</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
