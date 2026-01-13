import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Lock, Mail, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import CustomerNavbar from "@/components/CustomerNavbar";
import { toast } from "sonner";

export default function ForgotPassword() {
    const { t, i18n } = useTranslation();
    const [, setLocation] = useLocation();

    // State
    const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Mutations
    const requestReset = trpc.customer.requestPasswordReset.useMutation();
    const verifyOtp = trpc.customer.verifyOtp.useMutation();
    const resetPassword = trpc.customer.resetPasswordWithOtp.useMutation();

    // Handlers
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            toast.error(t('login.identifier_label') || "Please enter a valid email");
            return;
        }

        requestReset.mutate({ email }, {
            onSuccess: (data) => {
                toast.success(data.message || t('forgot_password.step_2_desc'));
                setStep('otp');
            },
            onError: (err) => {
                toast.error(err.message);
            }
        });
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) return;

        verifyOtp.mutate({ email, otp }, {
            onSuccess: (data) => {
                toast.success(data.message);
                setStep('password');
            },
            onError: (err) => {
                toast.error(err.message);
            }
        });
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error(t('login.password_min_length', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'));
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error(t('register.password_mismatch', 'كلمات المرور غير متطابقة'));
            return;
        }

        resetPassword.mutate({ email, otp, newPassword }, {
            onSuccess: (data) => {
                toast.success(data.message || t('forgot_password.success_msg'));
                setTimeout(() => setLocation('/login'), 2000);
            },
            onError: (err) => {
                toast.error(err.message);
            }
        });
    };

    const isLoading = requestReset.isPending || verifyOtp.isPending || resetPassword.isPending;
    const isRtl = i18n.dir() === 'rtl';

    return (
        <div className="min-h-screen bg-background pb-12">
            <CustomerNavbar />

            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
                <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full border border-border relative overflow-hidden transition-all duration-300">

                    {/* Progress Indicator */}
                    <div className="flex justify-center mb-8 gap-2">
                        <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'email' || step === 'otp' || step === 'password' ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'otp' || step === 'password' ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'password' ? 'bg-primary' : 'bg-muted'}`} />
                    </div>

                    {step === 'email' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold text-card-foreground text-center mb-2">{t('forgot_password.title', 'استعادة كلمة المرور')}</h1>
                            <p className="text-muted-foreground text-center mb-8 text-sm">{t('forgot_password.step_1_desc', 'أدخل بريدك الإلكتروني لاستلام رمز التحقق')}</p>

                            <form onSubmit={handleRequestOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-muted-foreground">{t('forgot_password.enter_email', 'البريد الإلكتروني')}</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('forgot_password.email_placeholder', 'example@gmail.com')}
                                        className="block w-full py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent px-4 outline-none text-left"
                                        dir="ltr"
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl text-lg shadow-lg hover:shadow-primary/20" disabled={isLoading}>
                                    {isLoading ? '...' : t('forgot_password.send_code', 'إرسال الرمز')}
                                </Button>
                            </form>
                        </div>
                    )}

                    {step === 'otp' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <button onClick={() => setStep('email')} className="absolute top-6 left-6 text-muted-foreground hover:text-foreground">
                                {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                            </button>

                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lock className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold text-card-foreground text-center mb-2">{t('forgot_password.enter_code', 'أدخل الرمز')}</h1>
                            <p className="text-muted-foreground text-center mb-8 text-sm">
                                {t('forgot_password.step_2_desc', 'تم إرسال رمز التحقق إلى بريدك الإلكتروني')} <br />
                                <span className="font-bold text-foreground" dir="ltr">{email}</span>
                            </p>

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="------"
                                        className="block w-full py-4 text-center text-3xl tracking-[0.5em] font-mono bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        disabled={isLoading}
                                        dir="ltr"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl text-lg shadow-lg hover:shadow-primary/20" disabled={isLoading}>
                                    {isLoading ? '...' : t('forgot_password.verify', 'تحقق')}
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleRequestOtp}
                                        className="text-sm text-primary hover:underline"
                                        disabled={isLoading}
                                    >
                                        {t('forgot_password.resend_code', 'إعادة إرسال الرمز')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 'password' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-xl font-bold text-card-foreground text-center mb-6">{t('forgot_password.step_3_desc', 'تعيين كلمة المرور الجديدة')}</h1>

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-muted-foreground">{t('forgot_password.new_password', 'كلمة المرور الجديدة')}</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="block w-full py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary px-4 outline-none"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-muted-foreground">{t('forgot_password.confirm_new_password', 'تأكيد كلمة المرور')}</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="block w-full py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary px-4 outline-none"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl text-lg shadow-lg mt-4 hover:shadow-primary/20" disabled={isLoading}>
                                    {isLoading ? '...' : t('forgot_password.reset_password', 'تغيير كلمة المرور')}
                                </Button>
                            </form>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-border text-center">
                        <Link href="/login" className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm">
                            {t('common.back_to_login', 'العودة لصفحة الدخول')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
