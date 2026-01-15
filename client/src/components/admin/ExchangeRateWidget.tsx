import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, DollarSign, Euro, PoundSterling, Coins, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

// Helper to map currency codes to icons and names
const getCurrencyInfo = (code: string) => {
    const map: Record<string, { name: string, icon: any, color: string }> = {
        "USD": { name: "الدولار الأمريكي", icon: DollarSign, color: "text-green-600" },
        "EUR": { name: "اليورو", icon: Euro, color: "text-blue-600" },
        "GBP": { name: "الجنيه الإسترليني", icon: PoundSterling, color: "text-purple-600" },
        "LYD": { name: "الدينار الليبي", icon: Coins, color: "text-yellow-600" },
    };
    return map[code.toUpperCase()] || { name: code, icon: Coins, color: "text-gray-600" };
};

export default function ExchangeRateWidget() {
    const { data, isLoading, error, refetch } = trpc.reports.getExchangeRates.useQuery(undefined, {
        refetchOnWindowFocus: false,
        retry: 1
    });

    // Adapt data to our display format
    // Expecting data to be either Array or Object with rates
    let rates: any[] = [];

    // Logic to parse different possible API responses until structure is confirmed
    if (data) {
        if (Array.isArray(data)) {
            rates = data;
        } else if (data.rates) {
            // Standard format { rates: { USD: 1.2, ... } }
            rates = Object.entries(data.rates).map(([curr, rate]) => ({
                currency: curr,
                rate: Number(rate)
            }));
        } else if (data.data && Array.isArray(data.data)) {
            rates = data.data;
        }
    }

    const hasError = error || (data && data.error);

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">أسعار الصرف</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {hasError ? (
                    <div className="text-center py-6">
                        <div className="bg-red-50 text-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-red-900">خطأ في الاتصال</p>
                        <p className="text-xs text-red-500 mt-1">يرجى التأكد من رابط API</p>
                    </div>
                ) : isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                                    <div className="space-y-1">
                                        <div className="w-10 h-3 bg-gray-200 rounded animate-pulse" />
                                        <div className="w-16 h-2 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : rates.length > 0 ? (
                    <div className="space-y-4">
                        {rates.map((item: any) => {
                            const info = getCurrencyInfo(item.currency || item.code || "USD");
                            const Icon = info.icon;
                            // Assume rate is relative to LYD if not specified, or display as is
                            const rateValue = item.rate || item.price || item.value || 0;

                            return (
                                <div key={item.currency || item.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 bg-gray-50 rounded-full ${info.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{item.currency || item.code}</span>
                                            <span className="text-xs text-muted-foreground">{info.name}</span>
                                        </div>
                                    </div>
                                    <span className="font-bold font-mono">{Number(rateValue).toFixed(2)} د.ل</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <div className="bg-blue-50 text-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Coins className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">لا توجد بيانات</p>
                        <p className="text-xs text-gray-500 mt-1">بانتظار تهيئة الرابط</p>
                    </div>
                )}

                <div className="mt-4 pt-2 border-t text-center">
                    <p className="text-xs text-muted-foreground">
                        يتم جلب الأسعار تلقائياً
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
