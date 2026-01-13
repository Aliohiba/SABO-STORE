import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Lock, Phone, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { guestCart } from "@/lib/guestCart";

export default function Login() {
    const { t, i18n } = useTranslation();
    const [, setLocation] = useLocation();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const customerLogin = trpc.customer.login.useMutation();
    const adminLogin = trpc.admin.login.useMutation();
    const addToCartMutation = trpc.cart.add.useMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!identifier || !password) {
            toast.error(t('common.fill_required') || "Please fill all required fields");
            return;
        }

        // تحديد نوع المستخدم تلقائياً
        const isEmail = identifier.includes("@");
        // Check if it contains mainly digits (allow separators like space, -, +)
        const isPhone = /^[\d\s\-\+]+$/.test(identifier);

        // إذا لم يكن بريداً إلكترونياً ولا رقم هاتف، نفترض أنه اسم مستخدم (أدمن)
        // Admin usernames usually contain letters and no @
        const isAdminLogin = !isEmail && !isPhone;

        const loadingToast = toast.loading(t('login.loading'));

        if (isAdminLogin) {
            // محاولة دخول كمسؤول
            adminLogin.mutate(
                { username: identifier, password },
                {
                    onSuccess: (data) => {
                        toast.dismiss(loadingToast);
                        toast.success(t('login.success_admin') || "Logged in as admin");
                        localStorage.setItem("adminToken", "true");
                        // استخدام window.location.href لضمان تحميل الحالة الجديدة من الخادم
                        window.location.href = "/admin/dashboard";
                    },
                    onError: (err) => {
                        toast.dismiss(loadingToast);
                        toast.error(err.message || t('login.invalid_credentials') || "Invalid credentials");
                    },
                }
            );
        } else {
            // محاولة دخول كعميل
            customerLogin.mutate(
                { identifier, password },
                {
                    onSuccess: async (data) => {
                        toast.dismiss(loadingToast);

                        // Check if there's a guest cart to merge
                        const guestItems = guestCart.getItems();

                        if (guestItems.length > 0) {
                            toast.success(`${t('login.success')} - جاري دمج السلة...`);

                            try {
                                // Merge guest cart with user cart
                                for (const item of guestItems) {
                                    await addToCartMutation.mutateAsync({
                                        productId: item.productId,
                                        quantity: item.quantity
                                    });
                                }

                                // Clear guest cart
                                guestCart.clear();

                                toast.success(`تم دمج ${guestItems.length} منتج من السلة المحلية`);
                            } catch (error) {
                                console.error('[Login] Failed to merge cart:', error);
                                toast.error('فشل دمج السلة، ولكن تم تسجيل الدخول بنجاح');
                            }
                        } else {
                            toast.success(t('login.success') || "Logged in successfully");
                        }

                        // Store token in localStorage
                        if (data.sessionToken) {
                            localStorage.setItem("customerToken", data.sessionToken);
                        }

                        // Redirect to Home page
                        setTimeout(() => {
                            window.location.href = "/";
                        }, 1000);
                    },
                    onError: (error) => {
                        toast.dismiss(loadingToast);
                        toast.error(error.message || t('login.invalid_credentials') || "Invalid credentials");
                    },
                }
            );
        }
    };

    const isLoading = customerLogin.isPending || adminLogin.isPending;

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-lg p-8 w-full max-w-md border border-border relative">
                <div className="absolute top-4 left-4 rtl:right-4 rtl:left-auto">
                    <LanguageSwitcher />
                </div>
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <a href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
                            <img
                                src="/logo.png"
                                alt="SABO STORE"
                                className="h-16 w-auto object-contain animate-[fadeInBounce_0.8s_ease-out]"
                                style={{
                                    animation: 'fadeInBounce 0.8s ease-out'
                                }}
                            />
                        </a>
                    </div>
                    <h1 className="text-2xl font-bold text-card-foreground mb-2">{t('login.title')}</h1>
                    <p className="text-muted-foreground text-sm">
                        {t('login.welcome')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">
                            {t('login.identifier_label')}
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                {identifier.includes("@") ? (
                                    <User className="h-5 w-5 text-muted-foreground" />
                                ) : identifier.match(/^[\d\s\-\+]+$/) ? (
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <User className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder={t('login.identifier_placeholder')}
                                className={`block w-full py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">
                            {t('login.password')}
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className={`block w-full py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-2">
                        <a href="/register" className="text-primary hover:text-primary/80 font-medium hover:underline">
                            {t('login.new_customer')}
                        </a>
                        <a href="/forgot-password" className="text-muted-foreground hover:text-foreground hover:underline">
                            {t('login.forgot_pass')}
                        </a>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-primary/20 transform active:scale-[0.99]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                <span>{t('login.loading')}</span>
                            </div>
                        ) : (
                            t('login.submit')
                        )}
                    </Button>
                </form>


            </div>
        </div>
    );
}
