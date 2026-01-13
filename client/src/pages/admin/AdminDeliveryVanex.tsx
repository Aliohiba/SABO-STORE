import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { CheckCircle, XCircle, Loader2, Save, Info, DollarSign, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AdminDeliveryVanex() {
    const citiesQuery = trpc.vanex.cities.useQuery();
    const settingsQuery = trpc.vanexSettings.get.useQuery();
    const updateSettingsMutation = trpc.vanexSettings.update.useMutation();

    const [testCount, setTestCount] = useState(0);

    // Initial state matching the schema
    const [settings, setSettings] = useState<any>({
        costOnAccount: "customer",
        additionalCostOnAccount: "customer",
        commissionOnAccount: "customer",
        allowInspection: false,
        allowMeasurement: false,
        isFragile: false,
        needsSafePackaging: false,
        isHeatSensitive: false,
        allow50Note: false,
    });

    // Load settings from server
    useEffect(() => {
        if (settingsQuery.data) {
            setSettings((prev: any) => ({ ...prev, ...settingsQuery.data }));
        }
    }, [settingsQuery.data]);

    const isLoading = citiesQuery.isLoading || citiesQuery.isRefetching;
    const isError = citiesQuery.isError;
    const isSuccess = citiesQuery.isSuccess && citiesQuery.data && citiesQuery.data.length > 0;

    const handleTestConnection = () => {
        setTestCount(prev => prev + 1);
        citiesQuery.refetch().then((result) => {
            if (result.isSuccess) {
                toast.success("تم الاتصال بـ Vanex بنجاح");
            } else {
                toast.error("فشل الاتصال بـ Vanex API");
            }
        });
    };

    const handleSaveSettings = async () => {
        try {
            await updateSettingsMutation.mutateAsync(settings);
            toast.success("تم حفظ إعدادات Vanex بنجاح");
            settingsQuery.refetch();
        } catch (error) {
            toast.error("فشل حفظ الإعدادات");
            console.error(error);
        }
    };

    const updateSetting = (key: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    // Helper to render Account Selects
    const AccountSelect = ({ label, value, field }: { label: string, value: string, field: string }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
            <Label className="text-sm font-medium text-gray-700">{label}</Label>
            <div className="flex items-center gap-2">
                <Select
                    value={value || "customer"}
                    onValueChange={(val) => updateSetting(field, val)}
                >
                    <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="customer">على العميل (Customer)</SelectItem>
                        <SelectItem value="store">على المتجر (Store)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    // Helper to render Feature Switches
    const FeatureSwitch = ({ label, desc, checked, field }: { label: string, desc?: string, checked: boolean, field: string }) => (
        <div className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:bg-gray-50/50 hover:border-gray-100 transition-all">
            <div className="space-y-0.5">
                <Label htmlFor={field} className="text-sm font-medium cursor-pointer text-gray-700 block">
                    {label}
                </Label>
                {desc && <p className="text-[11px] text-gray-400">{desc}</p>}
            </div>
            <Switch
                id={field}
                checked={checked || false}
                onCheckedChange={(val) => updateSetting(field, val)}
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50" dir="rtl">
            <AdminSidebar activePath="/admin/settings/delivery" />

            <main className="lg:mr-72 p-4 lg:p-8 transition-all duration-300">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-gray-200/60">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">إعدادات Vanex</h1>
                            <p className="text-sm text-gray-500">إدارة التكامل والخيارات الافتراضية لشركة التوصيل</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.history.back()}
                                className="text-gray-600 gap-2"
                            >
                                رجوع
                            </Button>
                        </div>
                    </div>

                    {/* Connection Status & Logo */}
                    <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-200">
                        <div className="bg-gradient-to-l from-blue-600/5 to-transparent h-1 absolute inset-x-0 top-0" />
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 shrink-0">
                                    <img
                                        src="/vanex-logo.png"
                                        alt="VANEX"
                                        className="h-16 w-auto object-contain mix-blend-multiply"
                                    />
                                </div>

                                <div className="flex-1 space-y-4 w-full text-center md:text-right">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <h2 className="text-lg font-bold text-gray-900">Vanex Delivery</h2>
                                            {isSuccess ? (
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 gap-1.5 font-normal border-0">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                    متصل بالخدمة
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-500 gap-1.5 font-normal">
                                                    <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                                                    غير متصل
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 max-w-2xl">
                                            مزود خدمة التوصيل السريع. يوفر خدمة تتبع الشحنات وحساب التكلفة تلقائياً.
                                            الحساب المرتبط: <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">Aliohiba7@gmail.com</span>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <Button
                                            variant={isSuccess ? "outline" : "default"}
                                            onClick={handleTestConnection}
                                            disabled={isLoading}
                                            className={`gap-2 min-w-[140px] ${!isSuccess && 'bg-blue-600 hover:bg-blue-700'}`}
                                        >
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isSuccess ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Loader2 className="h-4 w-4" />}
                                            {isLoading ? "جاري الفحص..." : isSuccess ? "إعادة فحص الربط" : "اتصال بالخدمة"}
                                        </Button>

                                        {isSuccess && (
                                            <div className="text-xs text-gray-400 font-mono px-2">
                                                {citiesQuery.data?.length} منطقة تغطية
                                            </div>
                                        )}

                                        {isError && (
                                            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                                                <XCircle className="h-3.5 w-3.5" />
                                                {citiesQuery.error?.message || "خطأ في الاتصال"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings Form Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                        {/* Right Column: Financial Settings */}
                        <div className="space-y-6">
                            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                                <CardHeader className="pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <DollarSign className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold text-gray-900">إعدادات الفوترة</CardTitle>
                                            <CardDescription className="text-xs">تحديد المسؤولية المالية للشحنات</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-1">
                                    <AccountSelect
                                        label="تكلفة التوصيل الأساسية"
                                        value={settings.costOnAccount}
                                        field="costOnAccount"
                                    />
                                    <div className="h-px bg-gray-100 mx-3 my-1" />
                                    <AccountSelect
                                        label="التكلفة الإضافية (للوزن/الحجم)"
                                        value={settings.additionalCostOnAccount}
                                        field="additionalCostOnAccount"
                                    />
                                    <div className="h-px bg-gray-100 mx-3 my-1" />
                                    <AccountSelect
                                        label="عمولة التحصيل (COD)"
                                        value={settings.commissionOnAccount}
                                        field="commissionOnAccount"
                                    />
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-0 ring-1 ring-gray-200 bg-blue-50/30">
                                <CardContent className="p-4 flex gap-3">
                                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-800 space-y-1">
                                        <p className="font-medium">ملاحظة مهمة</p>
                                        <p className="opacity-90 leading-relaxed text-xs">
                                            تغيير هذه الإعدادات سيطبق تلقائياً على جميع الطلبات الجديدة التي يتم تأكيدها وإرسالها إلى Vanex. الطلبات السابقة لن تتأثر.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Left Column: Shipment Properties */}
                        <div className="space-y-6">
                            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                                <CardHeader className="pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold text-gray-900">خصائص الشحنة</CardTitle>
                                            <CardDescription className="text-xs">التعليمات الافتراضية للتعامل مع الطرود</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 grid grid-cols-1 gap-1">
                                    <FeatureSwitch
                                        label="السماح بالفتح والمعاينة"
                                        desc="يسمح للعميل بفتح الطرد والتحقق من المحتوى قبل الاستلام."
                                        checked={settings.allowInspection}
                                        field="allowInspection"
                                    />
                                    <div className="h-px bg-gray-100 mx-3 my-1" />
                                    <FeatureSwitch
                                        label="السماح بالقياس"
                                        desc="يسمح للعميل بتجربة/قياس المنتج (للملابس والأحذية)."
                                        checked={settings.allowMeasurement}
                                        field="allowMeasurement"
                                    />
                                    <div className="h-px bg-gray-100 mx-3 my-1" />
                                    <FeatureSwitch
                                        label="قابل للكسر (Fragile)"
                                        desc="وضع ملصق 'قابل للكسر' والتعامل بحرص شديد."
                                        checked={settings.isFragile}
                                        field="isFragile"
                                    />
                                    <div className="h-px bg-gray-100 mx-3 my-1" />
                                    <FeatureSwitch
                                        label="تغليف آمن"
                                        checked={settings.needsSafePackaging}
                                        field="needsSafePackaging"
                                    />
                                    <div className="h-px bg-gray-100 mx-3 my-1" />
                                    <FeatureSwitch
                                        label="حساس للحرارة"
                                        checked={settings.isHeatSensitive}
                                        field="isHeatSensitive"
                                    />
                                    <div className="h-px bg-gray-100 mx-3 my-1" />
                                    <FeatureSwitch
                                        label="السماح بورقة 50"
                                        desc="قبول التعامل بالأوراق النقدية من فئة 50."
                                        checked={settings.allow50Note}
                                        field="allow50Note"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-4 z-10 mx-auto max-w-5xl">
                        <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-4 flex items-center justify-between gap-4">
                            <div className="text-sm text-gray-500 px-2 hidden sm:block">
                                آخر تحديث: {new Date().toLocaleDateString('ar-LY')}
                            </div>
                            <div className="flex items-center gap-3 mr-auto w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    onClick={handleSaveSettings}
                                    disabled={updateSettingsMutation.isPending}
                                    className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
                                >
                                    {updateSettingsMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-5 w-5" />
                                            حفظ التغييرات
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
