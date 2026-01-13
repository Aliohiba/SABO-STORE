import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminMarketing() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminToken");
    if (!isAdmin) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  // Queries
  const { data: settings, isLoading } = trpc.storeSettings.get.useQuery();
  const updateSettings = trpc.storeSettings.update.useMutation();

  // State
  const [walletSettings, setWalletSettings] = useState({
    cashbackEnabled: false,
    cashbackPercentage: 0,
    minOrderValueForCashback: 0,
    minProductsCountForCashback: 0,
    applyCashbackOn: 'subtotal' as 'subtotal' | 'total',
  });

  // Populate State
  useEffect(() => {
    if (settings?.walletSettings) {
      setWalletSettings({
        cashbackEnabled: settings.walletSettings.cashbackEnabled || false,
        cashbackPercentage: settings.walletSettings.cashbackPercentage || 0,
        minOrderValueForCashback: settings.walletSettings.minOrderValueForCashback || 0,
        minProductsCountForCashback: settings.walletSettings.minProductsCountForCashback || 0,
        applyCashbackOn: settings.walletSettings.applyCashbackOn || 'subtotal',
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({
      walletSettings
    }, {
      onSuccess: () => toast.success("تم تحديث إعدادات التسويق بنجاح"),
      onError: (err) => toast.error(`فشل التحديث: ${err.message}`)
    });
  };

  if (!localStorage.getItem("adminToken")) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar activePath="/admin/marketing" />
      <div className="lg:mr-72 lg:p-8 ml-0 p-4 transition-all duration-300">
        <h1 className="text-3xl font-bold mb-8">التسويق والعروض</h1>

        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            {/* إعدادات المحفظة والكاش باك */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border border-green-200">
                    <Wallet className="h-5 w-5 text-green-600" />
                  </div>
                  {settings?.storeLogo && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                      <img src={settings.storeLogo} alt="Store" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">إعدادات المحفظة والكاش باك</h2>
                  <p className="text-xs text-gray-500">التحكم في نظام المكافآت ورصيد العملاء</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <h3 className="font-medium text-gray-900">نظام الكاش باك</h3>
                    <p className="text-sm text-gray-500">تفعيل نظام استرجاع جزء من قيمة المشتريات لمحفظة العميل</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={walletSettings.cashbackEnabled}
                      onChange={(e) => setWalletSettings({ ...walletSettings, cashbackEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                {walletSettings.cashbackEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نسبة الكاش باك (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={walletSettings.cashbackPercentage}
                          onChange={(e) => setWalletSettings({ ...walletSettings, cashbackPercentage: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 pl-8"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-500">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">النسبة المئوية التي سترجع للعميل من قيمة الطلب</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الحد الأدنى للطلب
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={walletSettings.minOrderValueForCashback}
                          onChange={(e) => setWalletSettings({ ...walletSettings, minOrderValueForCashback: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 pl-12"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-500">د.ل</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">أقل قيمة للطلب لتفعيل الكاش باك</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الحد الأدنى لعدد المنتجات
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={walletSettings.minProductsCountForCashback}
                          onChange={(e) => setWalletSettings({ ...walletSettings, minProductsCountForCashback: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 pl-12"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-500">منتجات</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">أقل عدد منتجات في السلة لتفعيل الكاش باك</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        احتساب الكاش باك على
                      </label>
                      <select
                        value={walletSettings.applyCashbackOn}
                        onChange={(e) => setWalletSettings({ ...walletSettings, applyCashbackOn: e.target.value as 'subtotal' | 'total' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      >
                        <option value="subtotal">مجموع المنتجات فقط (Subtotal)</option>
                        <option value="total">الإجمالي الكلي (شامل التوصيل)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateSettings.isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                {updateSettings.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                حفظ التغييرات
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

