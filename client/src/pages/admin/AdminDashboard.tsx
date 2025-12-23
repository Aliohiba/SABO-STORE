import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { Package, ShoppingCart, Settings, LogOut, BarChart3, DollarSign, TrendingUp, ListChecks } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
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

  // Fetch other data
  const { data: orders = [] } = trpc.orders.all.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminToken");
    if (!isAdmin) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin/login");
  };

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
      <div className="fixed left-0 top-0 w-64 h-screen bg-blue-900 text-white p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">SABO STORE</h1>
          <p className="text-blue-200 text-sm">لوحة التحكم</p>
        </div>

        <nav className="space-y-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-800 gap-2">
              <BarChart3 className="h-5 w-5" />
              لوحة التحكم
            </Button>
          </Link>

          <Link href="/admin/products">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-800 gap-2">
              <Package className="h-5 w-5" />
              المنتجات
            </Button>
          </Link>

          <Link href="/admin/orders">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-800 gap-2">
              <ShoppingCart className="h-5 w-5" />
              الطلبات
            </Button>
          </Link>

          <Link href="/admin/settings">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-800 gap-2">
              <Settings className="h-5 w-5" />
              الإعدادات
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-white border-white hover:bg-blue-800 gap-2"
          >
            <LogOut className="h-5 w-5" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* Main Content */}
	<div className="mr-64 p-8">
    <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>

    {/* Sales Reports Section */}
    <Card className="mb-8">
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
              <div className="text-2xl font-bold">{totalSales.toFixed(2)} دينار</div>
              <p className="text-xs text-muted-foreground">الطلبات المكتملة في الفترة المحددة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{netProfit.toFixed(2)} دينار</div>
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
              <p className="text-xs text-muted-foreground">عدد الطلبات المكتملة</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    {/* Inventory Valuation Section */}
    <Card className="mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">القيمة الإجمالية للمخزون</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryValue?.toFixed(2) || "0.00"} دينار</div>
              <p className="text-xs text-muted-foreground">القيمة الإجمالية لجميع المنتجات النشطة في المخزون</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    {/* Recent Orders */}
    <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">آخر الطلبات</h2>

          {orders.length === 0 ? (
            <p className="text-gray-500">لا توجد طلبات حتى الآن</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-right py-3 px-4">رقم الطلب</th>
                    <th className="text-right py-3 px-4">العميل</th>
                    <th className="text-right py-3 px-4">المبلغ</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold">{order.orderNumber}</td>
                      <td className="py-3 px-4">{order.customerName}</td>
                      <td className="py-3 px-4">{parseFloat(order.totalAmount).toFixed(2)} دينار</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "shipped"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {order.status === "pending" && "قيد الانتظار"}
                          {order.status === "confirmed" && "مؤكد"}
                          {order.status === "shipped" && "مشحون"}
                          {order.status === "delivered" && "تم التسليم"}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString("ar-LY")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4">
            <Link href="/admin/orders">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">عرض جميع الطلبات</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
