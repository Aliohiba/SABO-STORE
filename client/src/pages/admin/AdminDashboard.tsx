import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { DollarSign, TrendingUp, ShoppingCart, ListChecks, Package, CreditCard, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, subDays, isWithinInterval, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [valuationType, setValuationType] = useState<"cost" | "sale">("sale");

  // Fetch Data
  const { data: salesMetrics, refetch: refetchSales } = trpc.reports.getSalesMetrics.useQuery({
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
  });

  const { data: inventoryValuation } = trpc.reports.getInventoryValuation.useQuery();
  const { data: allOrders = [] } = trpc.orders.all.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();

  // --- Data Processing for Charts ---

  // 1. Filter Orders by Date Range
  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return isWithinInterval(orderDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
    });
  }, [allOrders, dateRange]);

  // 2. Sales Over Time (Chart Data)
  const salesChartData = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return [];

    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      // Find orders for this day
      const daysOrders = filteredOrders.filter(o =>
        format(new Date(o.createdAt), 'yyyy-MM-dd') === dateStr && o.status !== 'cancelled'
      );

      const sales = daysOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
      const ordersCount = daysOrders.length;

      return {
        date: format(day, 'd MMM', { locale: ar }),
        fullDate: dateStr,
        sales: sales,
        orders: ordersCount
      };
    });
  }, [filteredOrders, dateRange]);

  // 3. Order Status Distribution (Pie Chart)
  const statusData = useMemo(() => {
    const counts = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    allOrders.forEach(order => {
      const status = order.status || 'pending';
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      }
    });

    return [
      { name: 'قيد الانتظار', value: counts.pending, color: '#f59e0b' }, // Amber
      { name: 'مؤكد', value: counts.confirmed, color: '#3b82f6' }, // Blue
      { name: 'مشحون', value: counts.shipped, color: '#8b5cf6' }, // Purple
      { name: 'تم التسليم', value: counts.delivered, color: '#10b981' }, // Green
    ].filter(item => item.value > 0);
  }, [allOrders]);

  // Handlers
  const handleDatePreset = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date()
    });
    setTimeout(refetchSales, 100);
  };

  // Metrics
  const totalSales = salesMetrics?.totalSales || filteredOrders.reduce((acc, o) => acc + (o.status === 'delivered' ? parseFloat(o.totalAmount) : 0), 0);
  const totalOrdersCount = salesMetrics?.totalOrders || filteredOrders.filter(o => o.status === 'delivered').length;
  const netProfit = salesMetrics?.netProfit || 0; // Requires backend calculation usually
  const inventoryValue = valuationType === "sale" ? inventoryValuation?.totalSaleValue : inventoryValuation?.totalCostValue;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminSidebar activePath="/admin/dashboard" />

      <div className="lg:mr-72 lg:p-8 ml-0 p-4 transition-all duration-300">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">لوحة التحكم</h1>
            <p className="text-gray-500 mt-1">نظرة عامة على أداء المتجر والمبيعات.</p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
            <Button
              variant={dateRange.from.getDate() === new Date().getDate() ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleDatePreset(0)}
              className="text-xs"
            >
              اليوم
            </Button>
            <Button
              variant={dateRange.from > subDays(new Date(), 8) && dateRange.from < subDays(new Date(), 6) ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleDatePreset(7)}
              className="text-xs"
            >
              7 أيام
            </Button>
            <Button
              variant={dateRange.from > subDays(new Date(), 31) ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleDatePreset(30)}
              className="text-xs"
            >
              30 يوم
            </Button>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <DateRangePicker
              dateRange={dateRange}
              setDateRange={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                  refetchSales();
                }
              }}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">إجمالي المبيعات</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-100 opacity-75" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{totalSales.toFixed(2)} د.ل</div>
              <p className="text-xs text-blue-100 mt-1 opacity-80 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                في الفترة المحددة
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">صافي الربح</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{netProfit.toFixed(2)} د.ل</div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-green-500" />
                هامش ربح تقديري
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">عدد الطلبات</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalOrdersCount}</div>
              <p className="text-xs text-gray-500 mt-1">طلبات مكتملة</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">قيمة المخزون</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{inventoryValue?.toFixed(2) || "0.00"} د.ل</div>
              <div className="flex items-center gap-2 mt-2">
                <Select value={valuationType} onValueChange={(value: "cost" | "sale") => setValuationType(value)}>
                  <SelectTrigger className="h-6 text-[10px] w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost">سعر التكلفة</SelectItem>
                    <SelectItem value="sale">سعر البيع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Main Sales Chart */}
          <Card className="lg:col-span-2 border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">تحليل المبيعات</CardTitle>
              <CardDescription>إيرادات المبيعات خلال الفترة المحددة</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[300px] w-full mt-4" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value} د.ل`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#2563eb' }}
                      formatter={(value: number) => [`${value.toFixed(2)} د.ل`, 'المبيعات']}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Donut Chart */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">توزيع الطلبات</CardTitle>
              <CardDescription>حالة جميع الطلبات في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full relative" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-10">
                  <div className="text-center">
                    <span className="block text-2xl font-bold">{allOrders.length}</span>
                    <span className="block text-xs text-gray-500">طلب كلي</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>آخر 5 طلبات</CardTitle>
              <CardDescription>أحدث الطلبات التي تم استلامها</CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" className="gap-2">
                عرض الكل <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">رقم الطلب</th>
                    <th className="px-6 py-3">العميل</th>
                    <th className="px-6 py-3">التاريخ</th>
                    <th className="px-6 py-3">الحالة</th>
                    <th className="px-6 py-3">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allOrders.slice(0, 5).map((order) => (
                    <tr key={order._id || order.id || order.orderNumber} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">#{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500" dir="ltr">
                        {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                          ${order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : ''}
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                          ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                         `}>
                          {order.status === 'pending' && "قيد الانتظار"}
                          {order.status === 'confirmed' && "مؤكد"}
                          {order.status === 'shipped' && "تم الشحن"}
                          {order.status === 'delivered' && "تم التسليم"}
                          {order.status === 'cancelled' && "ملغي"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{parseFloat(order.totalAmount).toFixed(2)} د.ل</td>
                    </tr>
                  ))}
                  {allOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        لا توجد طلبات حتى الآن
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
