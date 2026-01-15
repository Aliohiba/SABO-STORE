import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { DollarSign, TrendingUp, ShoppingCart, Printer } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ExchangeRateWidget from "@/components/admin/ExchangeRateWidget";

export default function AdminFinance() {
    const [, setLocation] = useLocation();
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
    });
    const [valuationType, setValuationType] = useState<"cost" | "sale">("sale");

    // Fetch Reports Data
    const { data: salesMetrics, refetch: refetchSales } = trpc.reports.getSalesMetrics.useQuery({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
    });
    const { data: inventoryValuation } = trpc.reports.getInventoryValuation.useQuery();
    const { data: categories = [] } = trpc.categories.list.useQuery();

    useEffect(() => {
        const isAdmin = localStorage.getItem("adminToken");
        if (!isAdmin) {
            setLocation("/admin/login");
        }
    }, [setLocation]);


    const handleDatePreset = (type: "month" | "year") => {
        const now = new Date();
        let fromDate: Date;
        if (type === "month") {
            fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
            fromDate = new Date(now.getFullYear(), 0, 1);
        }
        setDateRange({ from: fromDate, to: now });
        refetchSales();
    };

    const totalSales = salesMetrics?.totalSales || 0;
    const netProfit = salesMetrics?.netProfit || 0;
    const totalOrders = salesMetrics?.totalOrders || 0;
    const inventoryValue = valuationType === "sale" ? inventoryValuation?.totalSaleValue : inventoryValuation?.totalCostValue;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar activePath="/admin/finance" />

            {/* Main Content */}
            <div className="lg:mr-72 lg:p-8 ml-0 p-4 transition-all duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">المالية والجرد</h1>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                    <div className="xl:col-span-3 space-y-6">
                        {/* Sales Reports Section */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-2xl font-bold">تقارير المبيعات</CardTitle>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <Button onClick={() => handleDatePreset("month")} variant="outline" size="sm">
                                        شهري
                                    </Button>
                                    <Button onClick={() => handleDatePreset("year")} variant="outline" size="sm">
                                        سنوي
                                    </Button>
                                    <DateRangePicker
                                        dateRange={dateRange}
                                        setDateRange={(range) => {
                                            setDateRange(range);
                                            refetchSales();
                                        }}
                                    />
                                    <Link href={`/admin/reports/sales?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`} target="_blank">
                                        <Button variant="default" size="sm" className="bg-blue-600 text-white gap-2">
                                            <Printer className="w-4 h-4" />
                                            طباعة كشف
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{totalSales.toFixed(2)} د.ل</div>
                                            <p className="text-xs text-muted-foreground">الطلبات المكتملة في الفترة المحددة</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-green-700">{netProfit.toFixed(2)} د.ل</div>
                                            <p className="text-xs text-muted-foreground">الربح بعد خصم سعر التكلفة</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">عدد الطلبات</CardTitle>
                                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{totalOrders}</div>
                                            <p className="text-xs text-muted-foreground">عدد الطلبات المستلمة</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inventory Valuation Section */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-2xl font-bold">جرد المخزون</CardTitle>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <Select value={valuationType} onValueChange={(value: "cost" | "sale") => setValuationType(value)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="نوع الجرد" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cost">جرد بسعر التكلفة</SelectItem>
                                            <SelectItem value="sale">جرد بسعر البيع</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="bg-blue-50 border-blue-100">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-bold text-blue-800">القيمة الإجمالية للمخزون</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-blue-900">{inventoryValue?.toFixed(2) || "0.00"} د.ل</div>
                                            <p className="text-sm text-blue-600 mt-2">
                                                {valuationType === "sale" ? "محسوبة بسعر البيع الحالي للمنتجات" : "محسوبة بسعر التكلفة للمنتجات"}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gray-50 border-gray-100">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-bold text-gray-800">إحصائيات سريعة</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <span className="text-gray-600">عدد المنتجات النشطة</span>
                                                <span className="font-bold">{categories.length > 0 ? "..." : "..."}</span>
                                                <span className="text-xs text-gray-400">راجع صفحة المنتجات للتفاصيل</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="xl:col-span-1 space-y-6">
                        <ExchangeRateWidget />
                    </div>
                </div>
            </div>
        </div>
    );
}
