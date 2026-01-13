import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { trpc } from "@/lib/trpc";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AdminShipments() {
    const [, setLocation] = useLocation();
    const [page, setPage] = useState(1);
    const [provider, setProvider] = useState<"vanex" | "darb">("vanex");

    useEffect(() => {
        const isAdmin = localStorage.getItem("adminToken");
        if (!isAdmin) {
            setLocation("/admin/login");
        }
    }, [setLocation]);

    // Fetch Shipments from Vanex API
    const vanexQuery = trpc.vanex.getShipments.useQuery(
        { page },
        { enabled: provider === "vanex" }
    );

    // Fetch Shipments from Darb Sabil API
    const darbQuery = trpc.darbSabil.getShipments.useQuery(
        { page },
        { enabled: provider === "darb" }
    );

    const currentQuery = provider === "vanex" ? vanexQuery : darbQuery;
    const { data: rawData, isLoading, isError, error, refetch } = currentQuery;

    // Normalize Data
    // Vanex often returns { data: { data: [...] } } or { data: [...] }
    // Darb Sabil structure needs to be handled
    let shipments: any[] = [];
    if (rawData) {
        if (provider === "vanex") {
            shipments = (rawData as any)?.data?.data || (rawData as any)?.data || [];
        } else {
            // Robust check for array
            const d = (rawData as any)?.data;
            const l = (rawData as any)?.list;

            if (Array.isArray(d)) shipments = d;
            else if (Array.isArray(l)) shipments = l;
            else if (Array.isArray(rawData)) shipments = rawData;
            else shipments = [];
        }

        // Final safety check
        if (!Array.isArray(shipments)) {
            console.warn("Shipments data is not an array:", shipments);
            shipments = [];
        }
    }

    if (!localStorage.getItem("adminToken")) {
        return null;
    }

    const getStatusColor = (status: string) => {
        const s = String(status || '').toLowerCase();
        if (s.includes('cancel') || s.includes('ملغ') || s.includes('fail')) return 'destructive';
        if (s.includes('deliver') || s.includes('تم') || s.includes('success')) return 'default'; // green usually default in badge? or success
        return 'secondary';
    };

    const getStatusText = (status: string) => {
        const s = String(status || '').toLowerCase();
        const map: Record<string, string> = {
            'pending': 'قيد المعالجة',
            'confirmed': 'مؤكد',
            'processing': 'قيد التجهيز',
            'shipped': 'تم الشحن',
            'out_for_delivery': 'خرج للتوصيل',
            'delivered': 'تم التوصيل',
            'success': 'تم التوصيل',
            'completed': 'مكتمل',
            'cancelled': 'ملغى',
            'canceled': 'ملغى',
            'returned': 'راجع',
            'failed': 'فشل',
            'failure': 'فشل',
            'created': 'تم الإنشاء'
        };
        return map[s] || status || 'غير معروف';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar activePath="/admin/shipments" />

            <div className="flex-1 lg:mr-72 transition-all duration-300">
                <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">شحنات التوصيل</h1>
                            <p className="text-gray-500">متابعة حالة الشحنات من شركات التوصيل</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                                <RefreshCw className={`h-4 w-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
                                تحديث
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="vanex" onValueChange={(val) => setProvider(val as any)} dir="rtl" className="w-full">
                        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-white border">
                            <TabsTrigger value="vanex" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                                <img src="/vanex-logo.png" alt="Vanex" className="h-4 w-auto ml-2 object-contain" />
                                <span>Vanex</span>
                            </TabsTrigger>
                            <TabsTrigger value="darb" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                                <img src="/darb-sabil-logo.png" alt="Darb Sabil" className="h-6 w-auto ml-2 object-contain" />
                                <span>درب السبيل</span>
                            </TabsTrigger>
                        </TabsList>

                        {isError && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 border border-red-100">
                                <AlertCircle className="h-5 w-5" />
                                <span>فشل في جلب البيانات: {error.message}</span>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right" dir="rtl">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">رقم الشحنة</th>
                                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">العميل</th>
                                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">رقم الهاتف</th>
                                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">المبلغ</th>
                                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">الحالة</th>
                                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">التاريخ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-gray-500">جاري التحميل...</td>
                                            </tr>
                                        ) : shipments.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-gray-500">لا توجد شحنات متاحة حالياً</td>
                                            </tr>
                                        ) : (
                                            shipments.map((shipment: any, idx: number) => {
                                                // Normalize Row Data
                                                const id = shipment.id || shipment._id || shipment.reference || idx;
                                                const code = shipment.code || shipment.tracking_code || shipment.trackingNumber || shipment.reference || '-';

                                                // Darb Sabil might nest contact info or flat
                                                // Common patterns: receiver_name, receiver.name, or contact.name
                                                const customerName = shipment.reciever || shipment.receiver_name || shipment.customerName || (shipment.to ? shipment.to.name : '-') || '-';
                                                const phone = shipment.phone || shipment.receiver_phone || shipment.customerPhone || (shipment.to ? shipment.to.phone : '-') || '-';

                                                const amount = shipment.price || shipment.cod_value || shipment.amount || 0;
                                                const status = shipment.status || shipment.status_name || shipment.currentStatus || 'Unknown';
                                                const date = shipment.created_at || shipment.createdAt || '-';

                                                return (
                                                    <tr key={id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="py-4 px-6 font-medium text-gray-900" dir="ltr">{code}</td>
                                                        <td className="py-4 px-6 text-gray-700">{customerName}</td>
                                                        <td className="py-4 px-6 text-gray-500" dir="ltr">{phone}</td>
                                                        <td className="py-4 px-6 font-medium text-gray-900">{amount} د.ل</td>
                                                        <td className="py-4 px-6">
                                                            <Badge variant={getStatusColor(status) as any} className="whitespace-nowrap">
                                                                {getStatusText(status)}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-4 px-6 text-gray-500 text-xs font-mono">{new Date(date).toLocaleDateString('en-GB') === 'Invalid Date' ? date : new Date(date).toLocaleDateString('ar-KW')}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
