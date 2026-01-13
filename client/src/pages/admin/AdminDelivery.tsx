import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BackButton from "@/components/BackButton";
import { Truck, Settings, ExternalLink, AlertCircle, Power, ArrowRight } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminDelivery() {
    const { data: settings, refetch } = trpc.storeSettings.get.useQuery();
    const updateSettings = trpc.storeSettings.update.useMutation();

    // Default states
    const isVanexEnabled = settings?.deliveryProviders?.vanex !== false;
    const isDarbEnabled = settings?.deliveryProviders?.darb !== false;

    const handleToggleProvider = async (providerId: 'vanex' | 'darb', currentState: boolean) => {
        const newState = !currentState;

        // Create the update object properly
        const updateData: any = {
            deliveryProviders: {
                // Preserve the OTHER provider's state
                vanex: providerId === 'vanex' ? newState : isVanexEnabled,
                darb: providerId === 'darb' ? newState : isDarbEnabled,
            }
        };

        toast.promise(
            updateSettings.mutateAsync(updateData),
            {
                loading: 'جاري تحديث الحالة...',
                success: () => {
                    refetch();
                    return `تم ${newState ? 'تفعيل' : 'إيقاف'} ${providerId === 'vanex' ? 'فانكس' : 'درب السبيل'} بنجاح`;
                },
                error: 'حدث خطأ أثناء التحديث'
            }
        );
    };

    const deliveryProviders = [
        {
            id: "vanex",
            name: "فانكس (Vanex)",
            description: "تكامل كامل مع تتبع الشحنات وحساب التكلفة تلقائياً.",
            logo: "/vanex-logo.png",
            enabled: isVanexEnabled,
            link: "/admin/settings/delivery/vanex",
            features: ["تتبع آلي", "حساب تكلفة", "طباعة بوالص"]
        },
        {
            id: "darb",
            name: "درب السبيل (Darb Al-Sabil)",
            description: "خدمات لوجستية متطورة وتغطية واسعة.",
            logo: "/darb-sabil-logo.png",
            enabled: isDarbEnabled,
            link: "/admin/settings/delivery/darb-sabil",
            features: ["تغطية واسعة", "شحن سريع"]
        },
        {
            id: "custom",
            name: "توصيل خاص / آخر",
            description: "إدارة أسعار التوصيل يدوياً حسب المنطقة والمدينة.",
            logo: null,
            enabled: true, // Always enabled for now or manage separately
            status: "coming_soon",
            link: "/admin/settings/delivery/custom",
            features: ["تحكم يدوي", "مرونة كاملة"]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50" dir="rtl">
            <AdminSidebar activePath="/admin/settings/delivery" />

            <main className="lg:mr-72 p-4 lg:p-8 transition-all duration-300">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Back Button */}
                    <BackButton href="/admin/settings" label="العودة للإعدادات" />

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold text-gray-900">إعدادات التوصيل</h1>
                            <p className="text-gray-500 text-lg">تحكم في تفعيل وإيقاف شركات التوصيل وإعداداتها</p>
                        </div>
                    </div>

                    {/* Providers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deliveryProviders.map((provider) => (
                            <Card key={provider.id} className={`group hover:shadow-md transition-all duration-300 border-gray-200 ${!provider.enabled && provider.status !== 'coming_soon' ? 'opacity-75 bg-gray-50' : 'bg-white'}`}>
                                <CardHeader className="pb-4 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`h-16 w-16 rounded-xl flex items-center justify-center ${provider.logo ? 'bg-white border border-gray-100' : 'bg-blue-50'}`}>
                                            {provider.logo ? (
                                                <img
                                                    src={provider.logo}
                                                    alt={provider.name}
                                                    className={`h-12 w-12 object-contain mix-blend-multiply ${!provider.enabled ? 'grayscale' : ''}`}
                                                />
                                            ) : (
                                                <Truck className="h-8 w-8 text-blue-600" />
                                            )}
                                        </div>

                                        {provider.status === 'coming_soon' ? (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                قريباً
                                            </Badge>
                                        ) : (
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <Switch
                                                    id={`switch-${provider.id}`}
                                                    checked={provider.enabled}
                                                    onCheckedChange={() => handleToggleProvider(provider.id as 'vanex' | 'darb', provider.enabled)}
                                                />
                                                <Label htmlFor={`switch-${provider.id}`} className={`text-xs ${provider.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {provider.enabled ? 'مفعل' : 'متوقف'}
                                                </Label>
                                            </div>
                                        )}
                                    </div>
                                    <CardTitle className={`text-lg font-bold transition-colors ${provider.enabled ? 'group-hover:text-blue-600' : 'text-gray-500'}`}>
                                        {provider.name}
                                    </CardTitle>
                                    <CardDescription className="mt-2 line-clamp-2 min-h-[40px]">
                                        {provider.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {provider.features.map((feature, i) => (
                                            <span key={i} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-2">
                                    {provider.status !== 'coming_soon' && (
                                        <Link href={provider.link} className="w-full">
                                            <Button disabled={!provider.enabled} variant="outline" className="w-full gap-2">
                                                <Settings className="h-4 w-4" />
                                                إعدادات الربط
                                            </Button>
                                        </Link>
                                    )}
                                    {provider.status === 'coming_soon' && (
                                        <Button disabled className="w-full gap-2 bg-gray-100 text-gray-400 border border-gray-200">
                                            <AlertCircle className="h-4 w-4" />
                                            غير متاح حالياً
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* API Documentation Link Helper */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-full shadow-sm text-blue-600 hidden sm:block">
                                <ExternalLink className="h-6 w-6" />
                            </div>
                            <div className="space-y-1 text-center sm:text-right">
                                <h3 className="font-bold text-blue-900">توثيق المطورين (API Documentation)</h3>
                                <p className="text-blue-700/80 text-sm max-w-xl">
                                    للمزيد من المعلومات حول كيفية العمل التقني لشركات التوصيل، يمكنك مراجعة الوثائق الرسمية.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <a href="https://docs.vanex.ly/" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
                                    وثائق Vanex
                                    <ExternalLink className="mr-2 h-3 w-3" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
