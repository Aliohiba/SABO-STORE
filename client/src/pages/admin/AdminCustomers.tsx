import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Wallet, Plus, Minus, Loader2, Copy, Eye, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/useConfirm";

export default function AdminCustomers() {
  const [, setLocation] = useLocation();

  // Auth Check
  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  // State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Queries
  const { data, isLoading, refetch } = trpc.customer.getAll.useQuery({
    limit,
    offset: (page - 1) * limit,
    search
  });

  const { data: cities = [] } = trpc.cities.list.useQuery();

  const getCityName = (id: string) => {
    if (!id) return '';
    const city = cities.find((c: any) => String(c.id) === String(id) || String(c._id) === String(id));
    return city ? city.name : id;
  };

  // Mutations
  const addMoneyMutation = trpc.wallet.adminAddMoney.useMutation();
  const deductMoneyMutation = trpc.wallet.adminDeductMoney.useMutation();

  // Wallet Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [walletAction, setWalletAction] = useState<"add" | "deduct">("add");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [detailsCustomer, setDetailsCustomer] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  // Delete mutations
  const deleteCustomerMutation = trpc.customer.delete.useMutation();
  const deleteManyMutation = trpc.customer.deleteMany.useMutation();
  const { confirm, ConfirmDialog } = useConfirm();

  const openWalletDialog = (customer: any, action: "add" | "deduct") => {
    setSelectedCustomer(customer);
    setWalletAction(action);
    setAmount("");
    setDescription("");
    setIsWalletDialogOpen(true);
  };

  const handleWalletSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    try {
      if (walletAction === "add") {
        await addMoneyMutation.mutateAsync({
          customerId: selectedCustomer._id,
          amount: Number(amount),
          description
        });
        toast.success("تم إضافة الرصيد بنجاح");
      } else {
        await deductMoneyMutation.mutateAsync({
          customerId: selectedCustomer._id,
          amount: Number(amount),
          description
        });
        toast.success("تم خصم الرصيد بنجاح");
      }
      setIsWalletDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((c: any) => c._id));
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    const confirmed = await confirm({
      title: "حذف عميل",
      message: `هل أنت متأكد من حذف العميل "${customerName}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: "نعم، احذف",
      cancelText: "إلغاء",
      type: "danger"
    });

    if (!confirmed) return;

    try {
      await deleteCustomerMutation.mutateAsync({ id: customerId });
      toast.success("تم حذف العميل بنجاح");
      refetch();
      setSelectedCustomers(prev => prev.filter(id => id !== customerId));
    } catch (error: any) {
      toast.error(error.message || "فشل حذف العميل");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCustomers.length === 0) {
      toast.error("يرجى تحديد عملاء للحذف");
      return;
    }

    const confirmed = await confirm({
      title: "حذف العملاء المحددين",
      message: `هل أنت متأكد من حذف ${selectedCustomers.length} عميل؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: "نعم، احذف الكل",
      cancelText: "إلغاء",
      type: "danger"
    });

    if (!confirmed) return;

    try {
      await deleteManyMutation.mutateAsync({ ids: selectedCustomers });
      toast.success(`تم حذف ${selectedCustomers.length} عميل بنجاح`);
      refetch();
      setSelectedCustomers([]);
    } catch (error: any) {
      toast.error(error.message || "فشل حذف العملاء");
    }
  };

  const customers = data?.customers || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (!localStorage.getItem("adminToken")) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar activePath="/admin/customers" />

      <div className="lg:mr-72 lg:p-8 p-4 ml-0 transition-all duration-300" dir="rtl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">العملاء</h1>

          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="بحث بالاسم، الهاتف، أو البريد..."
              className="pr-10"
            />
          </div>

          {selectedCustomers.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              حذف المحدد ({selectedCustomers.length})
            </Button>
          )}
          <Link href="/register">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة عميل جديد
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-12">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedCustomers.length === customers.length && customers.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">الهاتف</TableHead>
                    <TableHead className="text-right">المنطقة</TableHead>
                    <TableHead className="text-right">رقم المحفظة</TableHead>
                    <TableHead className="text-right">المحفظة</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        لا يوجد عملاء
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer: any) => (
                      <TableRow key={customer._id} className="hover:bg-gray-50/50">
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={selectedCustomers.includes(customer._id)}
                              onCheckedChange={() => handleSelectCustomer(customer._id)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.email}</div>
                        </TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>
                          {getCityName(customer.cityId)}
                          {customer.area && ` - ${customer.area}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded select-all">{customer.walletNumber || '---'}</span>
                            {customer.walletNumber && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-500 hover:text-blue-600"
                                onClick={() => {
                                  if (customer.walletNumber) {
                                    navigator.clipboard.writeText(customer.walletNumber);
                                    toast.success("تم نسخ رقم المحفظة");
                                  }
                                }}
                                title="نسخ الرقم"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold flex items-center gap-1 text-green-700">
                            <Wallet className="h-4 w-4" />
                            {(customer.walletBalance || 0).toFixed(2)} د.ل
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              onClick={() => {
                                setDetailsCustomer(customer);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 ml-1" />
                              البيانات
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                              onClick={() => openWalletDialog(customer, "add")}
                            >
                              <Plus className="h-4 w-4 ml-1" />
                              إيداع
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => openWalletDialog(customer, "deduct")}
                            >
                              <Minus className="h-4 w-4 ml-1" />
                              خصم
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteCustomer(customer._id, customer.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                السابق
              </Button>
              <div className="flex items-center px-4 font-medium text-sm">
                صفحة {page} من {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                التالي
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Action Dialog */}
      <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {walletAction === "add" ? "إضافة رصيد" : "خصم رصيد"} - {selectedCustomer?.name}
            </DialogTitle>
            <DialogDescription>
              {walletAction === "add"
                ? "سيتم إضافة المبلغ إلى محفظة العميل"
                : "سيتم خصم المبلغ من محفظة العميل"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">المبلغ (د.ل)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الوصف (اختياري)</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={walletAction === "add" ? "مكافأة، استرجاع..." : "تصحيح رصيد..."}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWalletDialogOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleWalletSubmit}
              className={walletAction === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              disabled={addMoneyMutation.isPending || deductMoneyMutation.isPending}
            >
              {addMoneyMutation.isPending || deductMoneyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : null}
              تأكيد {walletAction === "add" ? "الإضافة" : "الخصم"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>بيانات العميل: {detailsCustomer?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {detailsCustomer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block">الاسم الكامل</label>
                    <div className="font-semibold">{detailsCustomer.name}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block">رقم الهاتف</label>
                    <div className="font-semibold" dir="ltr">{detailsCustomer.phone}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block">البريد الإلكتروني</label>
                    <div className="font-semibold break-all">{detailsCustomer.email || '---'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block">رقم المحفظة</label>
                    <div className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm inline-block mt-0.5">{detailsCustomer.walletNumber || '---'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block">المدينة</label>
                    <div>{getCityName(detailsCustomer.cityId)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block">المنطقة</label>
                    <div>{detailsCustomer.area || '---'}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block">العنوان التفصيلي</label>
                  <div className="bg-gray-50 p-3 rounded-md border text-sm mt-1 min-h-[50px] whitespace-pre-wrap">
                    {detailsCustomer.address || 'لا يوجد عنوان محدد'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                  <div>
                    <label className="text-sm font-medium text-blue-700 block">رصيد المحفظة</label>
                    <div className="font-bold text-xl text-blue-900">{(detailsCustomer.walletBalance || 0).toFixed(2)} د.ل</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700 block">تاريخ التسجيل</label>
                    <div className="text-sm text-blue-900 mt-1">
                      {new Date(detailsCustomer.createdAt).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
}
