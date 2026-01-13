import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Save } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BackButton from "@/components/BackButton";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminOrderSettings() {
    const [, setLocation] = useLocation();
    const [settings, setSettings] = useState({
        autoAcceptOrders: false,
        allowPartialPaymentCash: false,
        allowPartialPaymentElectronic: false,
        preferredDeliveryCompany: "darb",
        showDeliveryPriceBeforeCheckout: true,
        showBackupPhoneField: true,
        showEmailField: true,
        showSubscribeButton: true,
        defaultPaymentMethod: "cash" as "cash" | "immediate",
    });

    useEffect(() => {
        const isAdmin = localStorage.getItem("adminToken");
        if (!isAdmin) {
            setLocation("/admin/login");
        }
    }, [setLocation]);

    const { data: orderSettings, isLoading } = trpc.orderSettings.get.useQuery();
    const updateSettings = trpc.orderSettings.update.useMutation({
        onSuccess: () => {
            toast.success("✅ تم حفظ الإعدادات بنجاح!");
        },
        onError: (error: any) => {
            toast.error(`❌ خطأ في الحفظ: ${error.message}`);
        },
    });

    useEffect(() => {
        if (orderSettings) {
            setSettings({
                autoAcceptOrders: orderSettings.autoAcceptOrders,
                allowPartialPaymentCash: orderSettings.allowPartialPaymentCash,
                allowPartialPaymentElectronic: orderSettings.allowPartialPaymentElectronic,
                preferredDeliveryCompany: orderSettings.preferredDeliveryCompany,
                showDeliveryPriceBeforeCheckout: orderSettings.showDeliveryPriceBeforeCheckout,
                showBackupPhoneField: orderSettings.showBackupPhoneField,
                showEmailField: orderSettings.showEmailField,
                showSubscribeButton: orderSettings.showSubscribeButton,
                defaultPaymentMethod: orderSettings.defaultPaymentMethod,
            });
        }
    }, [orderSettings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings.mutate(settings);
    };

    if (!localStorage.getItem("adminToken")) {
        return null;
    }

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar activePath="/admin/settings/orders" />

            <div className="lg:mr-72 lg:p-8 ml-0 p-4" dir="rtl">
                <div className="mb-8">
                    <BackButton href="/admin/settings" label="العودة للإعدادات" />
                    <h1 className="text-3xl font-bold text-gray-900">إعدادات الطلبات</h1>
                    <p className="text-gray-600 mt-2">الإعدادات الافتراضية للطلبات</p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                        {/* قبول الطلب التلقائي */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">قبول الطلب تلقائي عند طلب الزبون.</h3>
                                <p className="text-sm text-gray-500 mt-1">سيتم قبول الطلبات تلقائياً بدون تأكيد من الإدارة</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.autoAcceptOrders}
                                    onChange={(e) => setSettings({ ...settings, autoAcceptOrders: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <hr />

                        {/* السماح بدفعات جزئية في الدفع النقدي */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">السماح بدفعات جزئية في الدفع النقدي.</h3>
                                <p className="text-sm text-gray-500 mt-1">يمكن للعملاء دفع جزء من المبلغ نقداً</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.allowPartialPaymentCash}
                                    onChange={(e) => setSettings({ ...settings, allowPartialPaymentCash: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <hr />

                        {/* السماح بدفعات جزئية في الدفع الإلكتروني */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">السماح بدفعات جزئية في الدفع الإلكتروني.</h3>
                                <p className="text-sm text-gray-500 mt-1">يمكن للعملاء دفع جزء من المبلغ إلكترونياً</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.allowPartialPaymentElectronic}
                                    onChange={(e) => setSettings({ ...settings, allowPartialPaymentElectronic: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <hr />

                        {/* طريقة التوصيل المفضلة */}
                        <div>
                            <label className="block font-medium text-gray-900 mb-3">طريقة التوصيل المفضلة</label>
                            <select
                                value={settings.preferredDeliveryCompany}
                                onChange={(e) => setSettings({ ...settings, preferredDeliveryCompany: e.target.value })}
                                className="w-full md:w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="darb">درب السبيل</option>
                                <option value="vanex">Vanex</option>
                            </select>
                        </div>

                        <hr />

                        {/* إظهار سعر التوصيل */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">إظهار سعر التوصيل للزبون قبل إتمام الطلب</h3>
                                <p className="text-sm text-gray-500 mt-1">عرض تكلفة التوصيل قبل إتمام عملية الشراء</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.showDeliveryPriceBeforeCheckout}
                                    onChange={(e) => setSettings({ ...settings, showDeliveryPriceBeforeCheckout: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <hr />

                        {/* إظهار حقل رقم هاتف احتياطي */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">إظهار حقل رقم هاتف احتياطي عند إتمام الطلب</h3>
                                <p className="text-sm text-gray-500 mt-1">السماح للعملاء بإدخال رقم هاتف بديل</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.showBackupPhoneField}
                                    onChange={(e) => setSettings({ ...settings, showBackupPhoneField: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <hr />

                        {/* إظهار حقل البريد الإلكتروني */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">إظهار حقل البريد الإلكتروني عند إتمام الطلب</h3>
                                <p className="text-sm text-gray-500 mt-1">السماح للعملاء بإدخال بريدهم الإلكتروني</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.showEmailField}
                                    onChange={(e) => setSettings({ ...settings, showEmailField: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <hr />

                        {/* إظهار زر اشترك الآن */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">إظهار زر اشترك الآن</h3>
                                <p className="text-sm text-gray-500 mt-1">عرض خيار الاشتراك في النشرة البريدية</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.showSubscribeButton}
                                    onChange={(e) => setSettings({ ...settings, showSubscribeButton: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <hr />

                        {/* وسيلة الدفع الافتراضية */}
                        <div>
                            <label className="block font-medium text-gray-900 mb-3">وسيلة الدفع الافتراضية</label>
                            <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash"
                                        checked={settings.defaultPaymentMethod === "cash"}
                                        onChange={(e) => setSettings({ ...settings, defaultPaymentMethod: e.target.value as "cash" })}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="mr-2 text-gray-700">عند الاستلام</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="immediate"
                                        checked={settings.defaultPaymentMethod === "immediate"}
                                        onChange={(e) => setSettings({ ...settings, defaultPaymentMethod: e.target.value as "immediate" })}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="mr-2 text-gray-700">فوري</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-6">
                        <Button
                            type="submit"
                            disabled={updateSettings.isPending}
                            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                        >
                            <Save className="h-5 w-5" />
                            {updateSettings.isPending ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
