import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Store, Facebook, Twitter, Instagram, Youtube, Linkedin, Plus, X, Image as ImageIcon, Wallet, Loader2, CreditCard, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BackButton from "@/components/BackButton";

export default function StoreSettings() {
    const [location, setLocation] = useLocation();
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);


    useEffect(() => {
        const isAdmin = localStorage.getItem("adminToken");
        if (!isAdmin) {
            setLocation("/admin/login");
        }
    }, [setLocation]);

    const { data: settings, isLoading, refetch } = trpc.storeSettings.get.useQuery();
    const { data: productsList } = trpc.products.list.useQuery({ limit: 1000 });
    const updateSettings = trpc.storeSettings.update.useMutation();
    // @ts-ignore - media router might not be typed yet
    const uploadMedia = trpc.media.upload.useMutation();

    const [formData, setFormData] = useState({
        storeName: "",
        storeDescription: "",
        storeLogo: "",
        favicon: "",
        banners: [] as string[],
        featuredSections: [] as { title: string; products: string[] }[],
        socialMedia: {
            facebook: "",
            twitter: "",
            instagram: "",
            tiktok: "",
            youtube: "",
            whatsapp: "",
            linkedin: "",
        },
        footer: {
            aboutText: "",
            email: "",
            phone: "",
            copyright: "",
            paymentText: "",
            quickLinks: [] as { label: string; url: string }[],
        },
        walletSettings: {
            cashbackEnabled: false,
            cashbackPercentage: 0,
            minOrderValueForCashback: 0,
            minProductsCountForCashback: 0,
            applyCashbackOn: 'subtotal' as 'subtotal' | 'total',
        },
        paymentMethods: {
            cash_on_delivery: true,
            moamalat: true,
            lypay: false,
        },
        hideCategoryNames: false,
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                storeName: settings.storeName || "",
                storeDescription: settings.storeDescription || "",
                storeLogo: settings.storeLogo || "",
                favicon: settings.favicon || "",
                banners: settings.banners || [],
                featuredSections: settings.featuredSections?.map((section: any) => ({
                    title: section.title,
                    products: section.products.map((p: any) => p.toString())
                })) || [],
                socialMedia: {
                    facebook: settings.socialMedia?.facebook || "",
                    twitter: settings.socialMedia?.twitter || "",
                    instagram: settings.socialMedia?.instagram || "",
                    tiktok: settings.socialMedia?.tiktok || "",
                    youtube: settings.socialMedia?.youtube || "",
                    whatsapp: settings.socialMedia?.whatsapp || "",
                    linkedin: settings.socialMedia?.linkedin || "",
                },
                footer: {
                    aboutText: settings.footer?.aboutText || "",
                    email: settings.footer?.email || "",
                    phone: settings.footer?.phone || "",
                    copyright: settings.footer?.copyright || "",
                    paymentText: settings.footer?.paymentText || "",
                    quickLinks: settings.footer?.quickLinks || [],
                },
                walletSettings: {
                    cashbackEnabled: settings.walletSettings?.cashbackEnabled || false,
                    cashbackPercentage: settings.walletSettings?.cashbackPercentage || 0,
                    minOrderValueForCashback: settings.walletSettings?.minOrderValueForCashback || 0,
                    minProductsCountForCashback: settings.walletSettings?.minProductsCountForCashback || 0,
                    applyCashbackOn: settings.walletSettings?.applyCashbackOn || 'subtotal',
                },
                paymentMethods: {
                    cash_on_delivery: settings.paymentMethods?.cash_on_delivery !== false,
                    moamalat: settings.paymentMethods?.moamalat !== false,
                    lypay: settings.paymentMethods?.lypay === true,
                },
                hideCategoryNames: settings.hideCategoryNames || false,
            });
        }
    }, [settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await updateSettings.mutateAsync(formData);
            toast.success("تم حفظ الإعدادات بنجاح");
            refetch();
        } catch (error) {
            toast.error("فشل حفظ الإعدادات");
            console.error("Error saving settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = (file: File, field: 'storeLogo' | 'favicon' | 'banner') => {
        if (!file) return;

        // Show loading immediately
        setUploading(true);
        const toastId = toast.loading("جاري رفع الصورة...");

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;

            try {
                // Upload to server
                const result = await uploadMedia.mutateAsync({
                    filename: file.name,
                    content: base64String,
                    contentType: file.type
                });

                if (field === 'banner') {
                    setFormData(prev => ({ ...prev, banners: [...prev.banners, result.url] }));
                } else {
                    setFormData(prev => ({ ...prev, [field]: result.url }));
                }

                toast.success("تم رفع الصورة بنجاح", { id: toastId });
            } catch (error) {
                console.error("Upload failed", error);
                toast.error("فشل رفع الصورة، تأكد من حجم الملف", { id: toastId });

                // Fallback: Try to use base64 directly if server upload fails (for backward compatibility if needed, though rarely works if limit exceeded)
                // But better not to clutter users data with huge strings if they knowingly wanted upload.
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    if (!localStorage.getItem("adminToken")) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <AdminSidebar activePath="/admin/store-settings" />
                <div className="lg:mr-72 lg:p-8 ml-0 p-4">
                    <div className="text-center">جاري التحميل...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <AdminSidebar activePath="/admin/store-settings" />

            <div className="lg:mr-72 lg:p-8 ml-0 p-4">
                <div className="mb-8">
                    <BackButton href="/admin/settings" label="العودة للإعدادات" />
                    <h1 className="text-3xl font-bold mb-2">إعدادات المتجر</h1>
                    <p className="text-gray-600">إعدادات خاصة بواجهة المتجر والهوية البصرية</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* معلومات المتجر الأساسية */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">المعلومات الأساسية</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم المتجر
                                </label>
                                <input
                                    type="text"
                                    value={formData.storeName}
                                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="اسم متجرك"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    وصف المتجر
                                </label>
                                <textarea
                                    value={formData.storeDescription}
                                    onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="وصف مختصر عن متجرك"
                                    rows={3}
                                />
                            </div>

                        </div>
                    </div>

                    {/* صور المتجر */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6 border-b pb-4">
                            <ImageIcon className="h-6 w-6 text-gray-600" />
                            <h2 className="text-xl font-bold">صور المتجر</h2>
                        </div>

                        <div className="space-y-8">
                            {/* شعار المتجر */}
                            <div className="border rounded-xl p-4">
                                <label className="block text-sm font-bold text-gray-700 mb-4">
                                    شعار المتجر
                                </label>
                                <div className="flex items-center gap-6">
                                    <div className="w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                                        {formData.storeLogo ? (
                                            <img src={formData.storeLogo} alt="Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-gray-400 text-xs">لا يوجد شعار</span>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'storeLogo')}
                                                className="hidden"
                                                id="store-logo-upload"
                                                disabled={uploading}
                                            />
                                            <label
                                                htmlFor="store-logo-upload"
                                                className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors ${uploading ? "bg-gray-100 cursor-not-allowed" : "hover:bg-gray-50"}`}
                                            >
                                                {uploading ? <Loader2 className="h-4 w-4 animate-spin text-gray-500" /> : <ImageIcon className="h-4 w-4 text-gray-500" />}
                                                <span className="text-sm font-medium text-gray-700">
                                                    {uploading ? "جاري الرفع..." : "اختر صورة من جهازك"}
                                                </span>
                                            </label>
                                            <p className="mt-2 text-xs text-gray-500">يفضل استخدام صورة بخلفية شفافة (PNG)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* الصور الدعائية */}
                            <div className="border rounded-xl p-4">
                                <label className="block text-sm font-bold text-gray-700 mb-4">
                                    الصور الدعائية (Banners)
                                </label>

                                <div className="flex flex-wrap gap-4 mb-4">
                                    {formData.banners.map((banner, index) => (
                                        <div key={index} className="relative w-48 h-24 border rounded-lg overflow-hidden group bg-black">
                                            <img src={banner} alt={`Banner ${index + 1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newBanners = formData.banners.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, banners: newBanners });
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* زر إضافة صورة جديدة */}
                                    <div className="relative w-48 h-24">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
                                            className="hidden"
                                            id="banner-upload"
                                            disabled={uploading}
                                        />
                                        <label
                                            htmlFor="banner-upload"
                                            className={`w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-blue-500 cursor-pointer transition-colors ${uploading ? "bg-gray-50 cursor-not-allowed" : "hover:bg-blue-50 hover:border-blue-400"}`}
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="h-6 w-6 mb-1 animate-spin" />
                                                    <span className="text-sm font-medium">جاري الرفع...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-6 w-6 mb-1" />
                                                    <span className="text-sm font-medium">إضافة صورة</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">هذه الصور ستظهر في شرائح العرض (Slider) في الصفحة الرئيسية. المقاس الموصى به: 1920x835 بكسل.</p>
                            </div>

                            {/* أيقونة المتصفح */}
                            <div className="border rounded-xl p-4">
                                <label className="block text-sm font-bold text-gray-700 mb-4">
                                    أيقونة المتصفح (Favicon)
                                </label>
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {formData.favicon ? (
                                            <img src={formData.favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                                        ) : (
                                            <span className="text-gray-400 text-xs text-center px-1">لا توجد</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'favicon')}
                                                className="hidden"
                                                id="favicon-upload"
                                            />
                                            <label
                                                htmlFor="favicon-upload"
                                                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <ImageIcon className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700">اختر صورة من جهازك</span>
                                            </label>
                                            <p className="mt-2 text-xs text-gray-500">الصورة الصغيرة التي تظهر بجانب عنوان الموقع في المتصفح. المقاس المفضل: 32x32 بكسل.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* قائمة الأقسام */}


                    {/* روابط التواصل الاجتماعي */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">روابط التواصل الاجتماعي</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Facebook */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Facebook className="h-5 w-5 text-blue-600" />
                                    فيسبوك
                                </label>
                                <input
                                    type="url"
                                    value={formData.socialMedia.facebook}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="https://facebook.com/yourpage"
                                />
                            </div>

                            {/* Twitter */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Twitter className="h-5 w-5 text-sky-500" />
                                    تويتر
                                </label>
                                <input
                                    type="url"
                                    value={formData.socialMedia.twitter}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialMedia: { ...formData.socialMedia, twitter: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="https://twitter.com/yourhandle"
                                />
                            </div>

                            {/* Instagram */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Instagram className="h-5 w-5 text-pink-600" />
                                    إنستغرام
                                </label>
                                <input
                                    type="url"
                                    value={formData.socialMedia.instagram}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="https://instagram.com/yourprofile"
                                />
                            </div>

                            {/* TikTok */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                    </svg>
                                    تيك توك
                                </label>
                                <input
                                    type="url"
                                    value={formData.socialMedia.tiktok}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialMedia: { ...formData.socialMedia, tiktok: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="https://tiktok.com/@yourprofile"
                                />
                            </div>

                            {/* YouTube */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Youtube className="h-5 w-5 text-red-600" />
                                    يوتيوب
                                </label>
                                <input
                                    type="url"
                                    value={formData.socialMedia.youtube}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialMedia: { ...formData.socialMedia, youtube: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="https://youtube.com/c/yourchannel"
                                />
                            </div>

                            {/* WhatsApp */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    واتساب
                                </label>
                                <input
                                    type="url"
                                    value={formData.socialMedia.whatsapp}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialMedia: { ...formData.socialMedia, whatsapp: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="https://wa.me/1234567890"
                                />
                            </div>

                            {/* LinkedIn */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Linkedin className="h-5 w-5 text-blue-700" />
                                    لينكد إن
                                </label>
                                <input
                                    type="url"
                                    value={formData.socialMedia.linkedin}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialMedia: { ...formData.socialMedia, linkedin: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="https://linkedin.com/company/yourcompany"
                                />
                            </div>
                        </div>
                    </div>

                    {/* إعدادات العرض */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">إعدادات العرض</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div>
                                    <label htmlFor="hide-category-names" className="block text-sm font-medium text-gray-700 cursor-pointer">
                                        إخفاء أسماء التصنيفات
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        عند التفعيل، سيتم إخفاء أسماء التصنيفات من الكاروسيل في الصفحة الرئيسية وستظهر الصور فقط
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="hide-category-names"
                                        checked={formData.hideCategoryNames}
                                        onChange={(e) => setFormData({ ...formData, hideCategoryNames: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* إعدادات طرق الدفع */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">طرق الدفع</h2>
                        <div className="space-y-4">
                            {/* Cash on Delivery */}
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <label htmlFor="payment-cod" className="block text-sm font-medium text-gray-700 cursor-pointer">
                                            الدفع عند الاستلام (Cash on Delivery)
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            تفعيل خيار الدفع نقداً عند استلام الطلب
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="payment-cod"
                                        checked={formData.paymentMethods.cash_on_delivery}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            paymentMethods: { ...formData.paymentMethods, cash_on_delivery: e.target.checked }
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Moamalat */}
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <label htmlFor="payment-moamalat" className="block text-sm font-medium text-gray-700 cursor-pointer">
                                            خدمة معاملات (Moamalat)
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            تفعيل خيار الدفع الإلكتروني عبر بطاقة معاملات
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="payment-moamalat"
                                        checked={formData.paymentMethods.moamalat}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            paymentMethods: { ...formData.paymentMethods, moamalat: e.target.checked }
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* LYPAY */}
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <label htmlFor="payment-lypay" className="block text-sm font-medium text-gray-700 cursor-pointer">
                                            لي باي (LYPAY)
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            تفعيل خيار الدفع الفوري عبر خدمة لي باي
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="payment-lypay"
                                        checked={formData.paymentMethods.lypay}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            paymentMethods: { ...formData.paymentMethods, lypay: e.target.checked }
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* إعدادات الفوتر (Footer) */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">تذييل الصفحة (Footer)</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نص "عن المتجر"
                                </label>
                                <textarea
                                    value={formData.footer.aboutText}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        footer: { ...formData.footer, aboutText: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="نبذة مختصرة تظهر في أسفل كل صفحة"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        البريد الإلكتروني للتواصل
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.footer.email}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            footer: { ...formData.footer, email: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        placeholder="info@store.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        رقم الهاتف للتواصل
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.footer.phone}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            footer: { ...formData.footer, phone: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        placeholder="+218 9XXXXXXXX"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نص حقوق النشر
                                </label>
                                <input
                                    type="text"
                                    value={formData.footer.copyright}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        footer: { ...formData.footer, copyright: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="© 2025 SABO STORE. جميع الحقوق محفوظة."
                                />
                            </div>

                            {/* Payment Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نص الدفع
                                </label>
                                <textarea
                                    value={formData.footer.paymentText}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        footer: { ...formData.footer, paymentText: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="نقبل الدفع عند الاستلام حالياً."
                                    rows={2}
                                />
                            </div>

                            {/* Quick Links */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الروابط السريعة
                                </label>
                                <div className="space-y-3">
                                    {formData.footer.quickLinks.map((link, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="نص الرابط"
                                                value={link.label}
                                                onChange={(e) => {
                                                    const newLinks = [...formData.footer.quickLinks];
                                                    newLinks[index].label = e.target.value;
                                                    setFormData({ ...formData, footer: { ...formData.footer, quickLinks: newLinks } });
                                                }}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="الرابط (مثال: /products)"
                                                value={link.url}
                                                onChange={(e) => {
                                                    const newLinks = [...formData.footer.quickLinks];
                                                    newLinks[index].url = e.target.value;
                                                    setFormData({ ...formData, footer: { ...formData.footer, quickLinks: newLinks } });
                                                }}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                dir="ltr"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newLinks = formData.footer.quickLinks.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, footer: { ...formData.footer, quickLinks: newLinks } });
                                                }}
                                                className="text-red-500 hover:text-red-700 p-2"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                footer: {
                                                    ...formData.footer,
                                                    quickLinks: [...formData.footer.quickLinks, { label: "", url: "" }]
                                                }
                                            });
                                        }}
                                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium gap-1"
                                    >
                                        <Plus className="h-4 w-4" />
                                        إضافة رابط جديد
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* زر الحفظ */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                        >
                            {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                        </Button>
                    </div>
                </form>
            </div >
        </div >
    );
}
