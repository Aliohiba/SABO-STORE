import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, ArrowRight } from "lucide-react";

export default function AdminSalesReport() {
    const [location, setLocation] = useLocation();
    const searchParams = new URLSearchParams(window.location.search);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const startDate = fromParam ? new Date(fromParam) : new Date();
    const endDate = toParam ? new Date(toParam) : new Date();

    const { data: report, isLoading } = trpc.reports.getDetailedSalesReport.useQuery({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    });

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return <div className="p-8 text-center">جاري تحميل التقرير...</div>;
    }

    if (!report) {
        return <div className="p-8 text-center">فشل تحميل التقرير</div>;
    }

    return (
        <div className="bg-white min-h-screen lg:p-8 p-4 text-black" dir="rtl">
            {/* Back Button */}
            <div className="mb-4 print:hidden">
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-gray-100"
                    onClick={() => setLocation("/admin/finance")}
                >
                    <ArrowRight className="w-5 h-5" />
                    عودة للمالية
                </Button>
            </div>

            {/* Header for Print */}
            <div className="flex justify-between items-start mb-8 border-b pb-4">
                <div className="flex items-center gap-4">
                    <img src="/sabo-logo.png" alt="Sabo Store" className="h-16 w-auto object-contain" />
                    <div>
                        <h1 className="text-2xl font-bold mb-1">كشف مبيعات</h1>
                        <p className="text-gray-600 font-bold">SABO STORE</p>
                    </div>
                </div>
                <div className="text-left">
                    <div className="mb-1"><span className="font-bold">من:</span> {startDate.toLocaleDateString('ar-LY')}</div>
                    <div className="mb-1"><span className="font-bold">إلى:</span> {endDate.toLocaleDateString('ar-LY')}</div>
                    <div className="text-sm text-gray-400 mt-2">تاريخ الطباعة: {new Date().toLocaleDateString('ar-LY')}</div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="border p-4 rounded bg-gray-50">
                    <div className="text-sm text-gray-500 mb-1">إجمالي المبيعات</div>
                    <div className="text-xl font-bold">{report.summary.totalSales.toFixed(2)} د.ل</div>
                </div>
                <div className="border p-4 rounded bg-gray-50">
                    <div className="text-sm text-gray-500 mb-1">إجمالي التكلفة</div>
                    <div className="text-xl font-bold">{report.summary.totalCost.toFixed(2)} د.ل</div>
                </div>
                <div className="border p-4 rounded bg-gray-50">
                    <div className="text-sm text-gray-500 mb-1">صافي الربح</div>
                    <div className="text-xl font-bold text-green-700">{report.summary.netProfit.toFixed(2)} د.ل</div>
                </div>
                <div className="border p-4 rounded bg-gray-50">
                    <div className="text-sm text-gray-500 mb-1">عدد المنتجات المباعة</div>
                    <div className="text-xl font-bold">{report.summary.totalItems}</div>
                </div>
            </div>

            {/* Detailed Table */}
            <table className="w-full text-right border-collapse mb-8">
                <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="p-3 border">المنتج</th>
                        <th className="p-3 border">الكمية</th>
                        <th className="p-3 border">سعر البيع (متوسط)</th>
                        <th className="p-3 border">سعر التكلفة (الوحدة)</th>
                        <th className="p-3 border">إجمالي المبيعات</th>
                        <th className="p-3 border">إجمالي التكلفة</th>
                        <th className="p-3 border">الربح</th>
                    </tr>
                </thead>
                <tbody>
                    {report.items.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 border">{item.productName}</td>
                            <td className="p-3 border font-bold">{item.quantity}</td>
                            <td className="p-3 border">{item.avgPrice.toFixed(2)}</td>
                            <td className="p-3 border">{item.unitCost.toFixed(2)}</td>
                            <td className="p-3 border font-bold">{item.totalSales.toFixed(2)}</td>
                            <td className="p-3 border">{item.totalCost.toFixed(2)}</td>
                            <td className={`p-3 border font-bold ${item.netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                {item.netProfit.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    {report.items.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-gray-500">لا توجد مبيعات في هذه الفترة</td>
                        </tr>
                    )}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                    <tr>
                        <td className="p-3 border text-center" colSpan={4}>المجموع الكلي</td>
                        <td className="p-3 border">{report.summary.totalSales.toFixed(2)}</td>
                        <td className="p-3 border">{report.summary.totalCost.toFixed(2)}</td>
                        <td className="p-3 border text-green-700">{report.summary.netProfit.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Action Button (Hidden during print) */}
            <div className="print:hidden text-center mt-8">
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Printer className="w-4 h-4" />
                    طباعة التقرير
                </Button>
            </div>

            <style>{`
        @media print {
            @page { size: landscape; margin: 1cm; }
            body { background: white; font-size: 12px; }
            .print\\:hidden { display: none !important; }
        }
      `}</style>
        </div>
    );
}
