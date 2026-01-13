import { useState } from "react";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDeliveryDarbSabil() {
    const activeCitiesQuery = trpc.darbSabil.cities.useQuery();
    const [testCount, setTestCount] = useState(0);

    const isLoading = activeCitiesQuery.isLoading || activeCitiesQuery.isRefetching;
    const isError = activeCitiesQuery.isError;
    const isSuccess = activeCitiesQuery.isSuccess;

    const handleTestConnection = () => {
        setTestCount(prev => prev + 1);
        activeCitiesQuery.refetch().then((result) => {
            if (result.isSuccess) {
                toast.success("تم الاتصال بـ درب السبيل بنجاح");
            } else {
                toast.error("فشل الاتصال بـ درب السبيل API");
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50/50" dir="rtl">
            <AdminSidebar activePath="/admin/settings/delivery" />

            <main className="lg:mr-72 p-4 lg:p-8 transition-all duration-300">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-gray-200/60">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">إعدادات درب السبيل</h1>
                            <p className="text-sm text-gray-500">إدارة الربط مع شركة درب السبيل للتوصيل</p>
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
                        <div className="bg-gradient-to-l from-red-600/5 to-transparent h-1 absolute inset-x-0 top-0" />
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 shrink-0">
                                    {/* Placeholder or actual logo if available */}
                                    {/* Logo */}
                                    <div className="h-16 w-16 flex items-center justify-center bg-white rounded-lg border border-gray-100 overflow-hidden p-1">
                                        <img src="/darb-sabil-logo.png" alt="Darb Sabil" className="w-full h-full object-contain" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 w-full text-center md:text-right">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <h2 className="text-lg font-bold text-gray-900">درب السبيل (Darb Al-Sabil)</h2>
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
                                            شركة رائدة في مجال الخدمات اللوجستية في ليبيا.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <Button
                                            variant={isSuccess ? "outline" : "default"}
                                            onClick={handleTestConnection}
                                            disabled={isLoading}
                                            className={`gap-2 min-w-[140px] ${!isSuccess && 'bg-red-600 hover:bg-red-700'}`}
                                        >
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isSuccess ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Loader2 className="h-4 w-4" />}
                                            {isLoading ? "جاري الفحص..." : isSuccess ? "إعادة فحص الربط" : "اتصال بالخدمة"}
                                        </Button>

                                        {isSuccess && (
                                            <div className="text-xs text-green-600 font-mono px-2 bg-green-50 py-1 rounded">
                                                تم الاتصال بنجاح API V1
                                            </div>
                                        )}

                                        {isError && (
                                            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                                                <XCircle className="h-3.5 w-3.5" />
                                                {activeCitiesQuery.error?.message || "خطأ في الاتصال"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Information Card */}
                    <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                        <CardHeader>
                            <CardTitle className="text-base">معلومات التكامل</CardTitle>
                            <CardDescription>النسخة الحالية تدعم إنشاء الطلبات وتتبعها فقط</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-500 leading-relaxed">
                            تم تفعيل الربط باستخدام مفاتيح API الخاصة بحسابك. سيتم إرسال الطلبات تلقائياً إلى نظام درب السبيل عند تأكيد الطلب واختيارها كشركة شحن.
                            <br /><br />
                            يرجى التأكد من أن أسعار التوصيل في المتجر متوافقة مع أسعار عقدك مع شركة درب السبيل.
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    );
}
