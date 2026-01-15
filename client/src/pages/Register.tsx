import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { User, Lock, Phone, Mail, MapPin, Home } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

export default function Register() {
    const { t, i18n } = useTranslation();
    const [, setLocation] = useLocation();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [cityId, setCityId] = useState<string | undefined>(undefined);
    const [area, setArea] = useState("");
    const [address, setAddress] = useState("");
    const [alternativePhone, setAlternativePhone] = useState("");

    const register = trpc.customer.register.useMutation();
    const { data: cities = [] } = trpc.cities.active.useQuery();

    // Fetch regions from our local DB, enabled only when cityId is selected
    const { data: regions = [] } = trpc.cities.getRegions.useQuery(
        { cityId: cityId || "" },
        { enabled: !!cityId }
    );

    useEffect(() => {
        console.log("Register Page - Cities Raw Data:", cities);
        if (Array.isArray(cities)) {
            console.log(`Register Page - Loaded ${cities.length} cities.`);
        } else {
            console.error("Register Page - Cities data is not an array:", cities);
        }
    }, [cities]);

    useEffect(() => {
        console.log("Register Page - Selected City ID:", cityId);
        console.log("Register Page - Regions Raw Data:", regions);
        if (Array.isArray(regions)) {
            console.log(`Register Page - Loaded ${regions.length} regions for city ${cityId}.`);
        }
    }, [regions, cityId]);

    useEffect(() => {
        setArea("");
    }, [cityId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!name || !phone || !password || !email) {
            toast.error(t('common.fill_required') || "Please fill all required fields");
            return;
        }

        if (name.length < 2) {
            toast.error("Name must be at least 2 characters");
            return;
        }

        if (phone.length < 10) {
            toast.error("Phone must be at least 10 numbers");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (!cityId) {
            toast.error("Please select a city");
            return;
        }

        if (regions.length > 0 && !area) {
            toast.error("Please select an area");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        register.mutate(
            {
                name,
                phone,
                email: email || undefined,
                password,
                cityId,
                area: area || undefined, // Optional
                address: address || undefined,
                alternativePhone: alternativePhone || undefined,
            },
            {
                onSuccess: () => {
                    toast.success("Account created successfully! Please login.");
                    setLocation("/login");
                },
                onError: (error: any) => {
                    toast.error(error.message || "An error occurred");
                },
            }
        );
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card rounded-lg shadow-lg p-6 md:p-8 w-full max-w-2xl border border-border relative">
                <div className="absolute top-4 left-4 rtl:right-4 rtl:left-auto flex items-center gap-2">
                    <ThemeToggle />
                    <LanguageSwitcher />
                </div>
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <a href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
                            <img src="/logo.png" alt="SABO STORE" className="h-16 w-16" />
                        </a>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-card-foreground">{t('register.title')}</h1>
                    <p className="text-muted-foreground mt-2">{t('register.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name - Required */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('register.full_name')} <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('register.full_name')}
                                className={`w-full py-2 border border-border bg-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                required
                            />
                        </div>
                    </div>

                    {/* Phone - Required */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('register.phone')} <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                <Phone className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="09XXXXXXXX"
                                className={`w-full py-2 border border-border bg-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                dir="ltr"
                                required
                            />
                        </div>
                    </div>

                    {/* Alternative Phone - Optional */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('register.alt_phone')}
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                <Phone className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="tel"
                                value={alternativePhone}
                                onChange={(e) => setAlternativePhone(e.target.value)}
                                placeholder="09XXXXXXXX"
                                className={`w-full py-2 border border-border bg-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* Email - Optional */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('register.email')} <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                <Mail className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@gmail.com"
                                className={`w-full py-2 border border-border bg-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                dir="ltr"
                                required
                            />
                        </div>
                    </div>

                    {/* City - Required */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('register.city')} <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <select
                                value={cityId || ""}
                                onChange={(e) => setCityId(e.target.value || undefined)}
                                className={`w-full py-2 border border-border bg-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                required
                            >
                                <option value="">{t('register.select_city')}</option>
                                {cities.map((city: any) => (
                                    <option key={city._id || city.id} value={city._id || city.id}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Area - Dynamic from DB */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {regions.length > 0 ? (
                                <>{t('register.area')} <span className="text-destructive">*</span></>
                            ) : (
                                t('register.area_optional')
                            )}
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                            </div>
                            {regions.length > 0 ? (
                                <select
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    className={`w-full py-2 border border-border bg-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                    required
                                >
                                    <option value="">{t('register.select_area')}</option>
                                    {regions.map((region: any) => (
                                        <option key={region._id || region.id} value={region.name}>
                                            {region.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    placeholder={t('register.area_placeholder')}
                                    className={`w-full py-2 border border-border bg-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                />
                            )}
                        </div>
                    </div>

                    {/* Address - Optional */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('register.address')}
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                <Home className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder={t('register.address_placeholder')}
                                className={`w-full py-2 border border-border bg-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px] ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Password - Required */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('register.password')} <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className={`w-full py-2 border border-border bg-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                required
                            />
                        </div>
                    </div>

                    {/* Confirm Password - Required */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('register.confirm_password')} <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${i18n.dir() === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className={`w-full py-2 border border-border bg-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${i18n.dir() === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={register.isPending}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg rounded-lg mt-6 shadow-md hover:shadow-primary/20"
                    >
                        {register.isPending ? t('register.processing') : t('register.submit')}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        {t('register.have_account')}{" "}
                        <a href="/login" className="text-primary hover:underline font-medium">
                            {t('register.login_link')}
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
