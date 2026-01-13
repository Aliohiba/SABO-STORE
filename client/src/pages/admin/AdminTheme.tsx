import { useRef, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BackButton from "@/components/BackButton";
import { Palette, Layout, Moon, Sun, Monitor, Type, MousePointerClick, ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminTheme() {
    const [, setLocation] = useLocation();

    // Check admin session
    const { data: adminData, isLoading: isAdminLoading, error: adminError } = trpc.admin.me.useQuery(undefined, {
        retry: false
    });

    // Get current theme settings
    const { data: storeSettings, isLoading: isSettingsLoading } = trpc.storeSettings.get.useQuery();

    const updateSettingsMutation = trpc.storeSettings.update.useMutation();

    const [isSaving, setIsSaving] = useState(false);

    // Initial state
    const [themeData, setThemeData] = useState({
        template: 'default', // default | dark | modern
        primaryColor: '#2563eb', // Blue 600
        secondaryColor: '#1e293b', // Slate 800
        backgroundColor: '#ffffff',
        textColor: '#0f172a', // Slate 900
        headerColor: '',
        footerColor: '',
        buttonRadius: '0.5rem',
    });

    useEffect(() => {
        if (storeSettings?.theme) {
            setThemeData({
                template: storeSettings.theme.template || 'default',
                primaryColor: storeSettings.theme.primaryColor || '#2563eb',
                secondaryColor: storeSettings.theme.secondaryColor || '#1e293b',
                backgroundColor: storeSettings.theme.backgroundColor || '#ffffff',
                textColor: storeSettings.theme.textColor || '#0f172a',
                headerColor: storeSettings.theme.headerColor || '',
                footerColor: storeSettings.theme.footerColor || '',
                buttonRadius: storeSettings.theme.buttonRadius || '0.5rem',
            });
        }
    }, [storeSettings]);

    // Handle initial loading and redirect
    if (isAdminLoading) return <div className="p-10">جاري التحميل...</div>;
    if (adminError || !adminData) {
        setLocation("/admin/login");
        return null;
    }

    const handleTemplateSelect = (template: 'default' | 'dark' | 'modern') => {
        // Prevent resetting if clicking the already active template
        if (template === themeData.template) {
            return;
        }

        if (template === 'dark') {
            setThemeData(prev => ({
                ...prev,
                template: 'dark',
                primaryColor: '#3b82f6', // Vibrant Blue (good for dark mode with black text or vibrant accents)
                secondaryColor: '#18181b', // Zinc 900 (Cards)
                backgroundColor: '#09090b', // Zinc 950 (Deep Background)
                textColor: '#fafafa', // Zinc 50
                headerColor: '',
                footerColor: '#09090b',
            }));
        } else if (template === 'default') {
            setThemeData(prev => ({
                ...prev,
                template: 'default',
                primaryColor: '#2563eb', // Blue 600 (Accessible with white text)
                secondaryColor: '#1e293b',
                backgroundColor: '#ffffff',
                textColor: '#0f172a',
                headerColor: '',
                footerColor: '',
            }));
        } else {
            // Modern
            setThemeData(prev => ({
                ...prev,
                template: 'modern',
                primaryColor: '#7c3aed', // Violet 600 (Accessible with white text)
                secondaryColor: '#1e1b4b',
                backgroundColor: '#f8fafc',
                textColor: '#0f172a', // Darker text for better contrast
                buttonRadius: '1rem', // More rounded
            }));
        }
    };

    const handleColorChange = (key: string, value: string) => {
        setThemeData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateSettingsMutation.mutateAsync({
                theme: themeData
            });
            toast.success("تم حفظ إعدادات الثيم بنجاح");
        } catch (error) {
            console.error(error);
            toast.error("حدث خطأ أثناء الحفظ");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="lg:mr-72 lg:p-8 ml-0 p-4">
                <div className="mb-8">
                    <BackButton href="/admin/settings" label="العودة للإعدادات" />
                    <h1 className="text-3xl font-bold text-gray-900">مظهر المتجر (Themes)</h1>
                    <p className="text-gray-500 mt-2">خصص ألوان وتصميم متجرك ليناسب هويتك التجارية</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">

                    {/* Template Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Default Card */}
                        <div
                            onClick={() => handleTemplateSelect('default')}
                            className={`
                                cursor-pointer rounded-xl border-2 p-4 transition-all hover:scale-105 active:scale-95
                                ${themeData.template === 'default'
                                    ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                                    : 'border-gray-200 bg-white hover:border-blue-200 text-gray-500'}
                            `}
                        >
                            <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden border">
                                <div className="h-full w-full flex">
                                    <div className="w-1/4 bg-gray-50 border-r"></div>
                                    <div className="w-3/4 p-2">
                                        <div className="h-2 w-1/3 bg-blue-600 rounded mb-2"></div>
                                        <div className="h-20 bg-blue-50 rounded"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold">الافتراضي (فاتح)</span>
                                {themeData.template === 'default' && <Sun className="w-5 h-5 text-blue-500" />}
                            </div>
                        </div>

                        {/* Modern Card */}
                        <div
                            onClick={() => handleTemplateSelect('modern')}
                            className={`
                                cursor-pointer rounded-xl border-2 p-4 transition-all hover:scale-105 active:scale-95
                                ${themeData.template === 'modern'
                                    ? 'border-violet-500 bg-violet-50/50 shadow-md ring-2 ring-violet-500/20'
                                    : 'border-gray-200 bg-white hover:border-violet-200 text-gray-500'}
                            `}
                        >
                            <div className="aspect-video bg-gray-50 rounded-lg mb-3 overflow-hidden border">
                                <div className="h-full w-full p-2 flex flex-col items-center justify-center">
                                    <div className="h-2 w-1/2 bg-violet-600 rounded-full mb-2"></div>
                                    <div className="flex gap-2 w-full justify-center">
                                        <div className="h-10 w-10 bg-violet-100 rounded-lg"></div>
                                        <div className="h-10 w-10 bg-violet-100 rounded-lg"></div>
                                        <div className="h-10 w-10 bg-violet-100 rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold">عصري (Modern)</span>
                                {themeData.template === 'modern' && <Monitor className="w-5 h-5 text-violet-500" />}
                            </div>
                        </div>

                        {/* Dark Mode Card */}
                        <div
                            onClick={() => handleTemplateSelect('dark')}
                            className={`
                                cursor-pointer rounded-xl border-2 p-4 transition-all hover:scale-105 active:scale-95
                                ${themeData.template === 'dark'
                                    ? 'border-zinc-800 bg-zinc-900 shadow-md ring-2 ring-zinc-500/20 text-white'
                                    : 'border-gray-200 bg-zinc-900 hover:border-zinc-600 text-gray-400'}
                            `}
                        >
                            <div className="aspect-video bg-black rounded-lg mb-3 overflow-hidden border border-zinc-800">
                                <div className="h-full w-full flex">
                                    <div className="w-1/4 bg-zinc-900 border-r border-zinc-800"></div>
                                    <div className="w-3/4 p-2">
                                        <div className="h-2 w-1/3 bg-blue-500 rounded mb-2"></div>
                                        <div className="h-20 bg-zinc-900 rounded border border-zinc-800"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold">الوضع الليلي (Pro)</span>
                                {themeData.template === 'dark' && <Moon className="w-5 h-5 text-blue-400" />}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Colors Settings */}
                        <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-4">
                                <Palette className="w-5 h-5 text-gray-500" />
                                تخصيص الألوان
                            </h2>

                            <div className="space-y-4">
                                {/* Primary Color */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block font-medium text-gray-700">اللون الأساسي (Primary)</label>
                                        <p className="text-xs text-gray-500">لون الأزرار، الروابط، والعناصر النشطة</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{themeData.primaryColor}</span>
                                        <input
                                            type="color"
                                            value={themeData.primaryColor}
                                            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                                            className="h-10 w-16 rounded cursor-pointer border-0 p-0"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleColorChange('primaryColor', themeData.template === 'dark' ? '#3b82f6' : '#2563eb')}
                                        >
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>

                                {/* Secondary Color */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div>
                                        <label className="block font-medium text-gray-700">اللون الثانوي (Secondary)</label>
                                        <p className="text-xs text-gray-500">لون العناصر الفرعية والخلفيات الداكنة</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{themeData.secondaryColor}</span>
                                        <input
                                            type="color"
                                            value={themeData.secondaryColor}
                                            onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                                            className="h-10 w-16 rounded cursor-pointer border-0 p-0"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleColorChange('secondaryColor', themeData.template === 'dark' ? '#18181b' : '#ffffff')}
                                        >
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>

                                {/* Background Color */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div>
                                        <label className="block font-medium text-gray-700">لون الخلفية (Background)</label>
                                        <p className="text-xs text-gray-500">الخلفية العامة للموقع</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{themeData.backgroundColor}</span>
                                        <input
                                            type="color"
                                            value={themeData.backgroundColor}
                                            onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                                            className="h-10 w-16 rounded cursor-pointer border-0 p-0"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleColorChange('backgroundColor', themeData.template === 'dark' ? '#09090b' : '#ffffff')}
                                        >
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>

                                {/* Text Color */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div>
                                        <label className="block font-medium text-gray-700">لون النصوص</label>
                                        <p className="text-xs text-gray-500">اللون الأساسي للنصوص في الموقع</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{themeData.textColor}</span>
                                        <input
                                            type="color"
                                            value={themeData.textColor}
                                            onChange={(e) => handleColorChange('textColor', e.target.value)}
                                            className="h-10 w-16 rounded cursor-pointer border-0 p-0"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleColorChange('textColor', themeData.template === 'dark' ? '#fafafa' : '#0f172a')}
                                        >
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Layout & Components Settings */}
                        <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-4">
                                <Layout className="w-5 h-5 text-gray-500" />
                                التخطيط والمكونات
                            </h2>

                            <div className="space-y-4">
                                {/* Header Color */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block font-medium text-gray-700">لون الشريط العلوي (Header)</label>
                                        <p className="text-xs text-gray-500">اتركه فارغاً لاستخدام الإعدادات الافتراضية للثيم</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={themeData.headerColor || '#ffffff'}
                                            onChange={(e) => handleColorChange('headerColor', e.target.value)}
                                            className="h-10 w-16 rounded cursor-pointer border-0 p-0"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleColorChange('headerColor', '')}
                                        >
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>

                                {/* Footer Color */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div>
                                        <label className="block font-medium text-gray-700">لون التذييل (Footer)</label>
                                        <p className="text-xs text-gray-500">اتركه فارغاً لاستخدام الإعدادات الافتراضية</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={themeData.footerColor || '#111827'}
                                            onChange={(e) => handleColorChange('footerColor', e.target.value)}
                                            className="h-10 w-16 rounded cursor-pointer border-0 p-0"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleColorChange('footerColor', '')}
                                        >
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>

                                {/* Radius Slider */}
                                <div className="pt-4 border-t">
                                    <label className="block font-medium text-gray-700 mb-4 flex items-center gap-2">
                                        <MousePointerClick className="w-4 h-4" />
                                        استدارة الزوايا (Border Radius)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={parseFloat(themeData.buttonRadius) || 0}
                                            onChange={(e) => handleColorChange('buttonRadius', `${e.target.value}rem`)}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded min-w-[3rem] text-center">
                                            {themeData.buttonRadius}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex gap-4 justify-center">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-primary text-primary-foreground border"
                                            style={{ borderRadius: themeData.buttonRadius, backgroundColor: themeData.primaryColor, color: '#fff' }}
                                        >
                                            زر تجريبي
                                        </button>
                                        <div
                                            className="px-4 py-2 border bg-white"
                                            style={{ borderRadius: themeData.buttonRadius }}
                                        >
                                            حاوية تجريبية
                                        </div>

                                        {/* Smart Switch Preview */}
                                        <div className="flex items-center gap-4 border-r pr-4 mr-4">
                                            <span className="text-sm font-medium text-gray-500">معاينة زر التبديل:</span>

                                            {/* Dark Mode Preview */}
                                            <div
                                                className={`
                                                    relative w-14 h-7 rounded-full cursor-pointer p-1 transition-colors duration-500 border flex items-center justify-end
                                                `}
                                                style={{
                                                    backgroundColor: '#18181b',
                                                    borderColor: '#27272a'
                                                }}
                                            >
                                                <div className="absolute inset-0 flex justify-between items-center px-2 text-[10px] pointer-events-none select-none overflow-hidden">
                                                    <span className="opacity-100">✨</span>
                                                    <span className="opacity-0">☁️</span>
                                                </div>

                                                <div
                                                    className="w-5 h-5 rounded-full shadow-md flex items-center justify-center relative z-10 bg-zinc-950"
                                                >
                                                    <Moon className="w-3 h-3" style={{ color: themeData.primaryColor, fill: themeData.primaryColor }} />
                                                </div>
                                            </div>

                                            {/* Light Mode Preview */}
                                            <div
                                                className={`
                                                    relative w-14 h-7 rounded-full cursor-pointer p-1 transition-colors duration-500 border flex items-center justify-start
                                                `}
                                                style={{
                                                    backgroundColor: `${themeData.primaryColor}1a`, // 10% opacity fallback
                                                    borderColor: `${themeData.primaryColor}4d`    // 30% opacity fallback
                                                }}
                                            >
                                                <div className="absolute inset-0 flex justify-between items-center px-2 text-[10px] pointer-events-none select-none overflow-hidden">
                                                    <span className="opacity-0">✨</span>
                                                    <span className="opacity-100">☁️</span>
                                                </div>

                                                <div
                                                    className="w-5 h-5 rounded-full shadow-md flex items-center justify-center relative z-10 bg-white"
                                                >
                                                    <Sun className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
                        >
                            {isSaving ? "جاري الحفظ وتطبيق الثيم..." : "حفظ التغييرات"}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}
