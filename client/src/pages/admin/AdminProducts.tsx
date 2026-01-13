import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Plus, Edit2, Trash2, CheckSquare, Square, ChevronDown, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminProducts() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminToken");
    if (!isAdmin) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: products = [], refetch } = trpc.products.all.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const { data: categories = [] } = trpc.categories.list.useQuery(undefined, {
    refetchOnMount: true,
  });

  // تحديث تلقائي عند فتح الصفحة
  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteProduct = trpc.products.delete.useMutation();
  const updateProduct = trpc.products.update.useMutation(); // For bulk updates

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    id?: number; // For single delete
    count?: number; // For bulk delete
  }>({ isOpen: false, type: 'single' });

  // Toggle select all
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p: any) => p._id || p.id));
    }
  };

  // Toggle select single product
  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: 'display' | 'hide' | 'delete') => {
    if (selectedProducts.length === 0) return;

    if (action === 'delete') {
      setDeleteConfirmation({
        isOpen: true,
        type: 'bulk',
        count: selectedProducts.length
      });
    } else {
      // Display or Hide
      const status = action === 'display' ? 'displayed' : 'hidden'; // Correct enum values
      const active = action === 'display';

      const updatePromises = selectedProducts.map(id =>
        updateProduct.mutateAsync({
          id,
          status: status as any,
          active: active
        })
      );

      try {
        await Promise.all(updatePromises);
        const actionText = action === 'display' ? 'تفعيل' : 'إخفاء';
        toast.success(`✅ تم ${actionText} ${selectedProducts.length} منتج بنجاح`);
        setSelectedProducts([]);
        refetch();
      } catch (error) {
        console.error("Bulk update error:", error);
        toast.error("حدث خطأ أثناء التحديث الجماعي");
      }
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.type === 'single' && deleteConfirmation.id) {
      deleteProduct.mutate(
        { id: deleteConfirmation.id },
        {
          onSuccess: () => {
            refetch();
            toast.success("✅ تم حذف المنتج بنجاح");
            setDeleteConfirmation({ isOpen: false, type: 'single' });
          },
          onError: (error: any) => {
            console.error("خطأ في حذف المنتج:", error);
            toast.error(`❌ خطأ في الحذف: ${error.message || "حدث خطأ غير متوقع"}`);
            setDeleteConfirmation({ isOpen: false, type: 'single' });
          },
        }
      );
    } else if (deleteConfirmation.type === 'bulk') {
      const deletePromises = selectedProducts.map(id =>
        deleteProduct.mutateAsync({ id })
      );

      try {
        await Promise.all(deletePromises);
        toast.success(`✅ تم حذف ${selectedProducts.length} منتج بنجاح`);
        setSelectedProducts([]);
        refetch();
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("حدث خطأ أثناء الحذف الجماعي");
      }
      setDeleteConfirmation({ isOpen: false, type: 'bulk' });
    }
  };


  const handleDelete = (id: number) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'single',
      id: id
    });
  };

  if (!localStorage.getItem("adminToken")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <AdminSidebar activePath="/admin/products" />

      {/* Alert Dialog */}
      <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(open) => {
        if (!open) setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmation.type === 'bulk'
                ? `أنت على وشك حذف ${deleteConfirmation.count} منتجات. لا يمكن التراجع عن هذا الإجراء.`
                : "أنت على وشك حذف هذا المنتج. لا يمكن التراجع عن هذا الإجراء."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <div className="lg:mr-72 ml-0 transition-all duration-300" dir="rtl">
        <div className="lg:p-8 p-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">المنتجات</h1>
              <p className="text-sm text-gray-500 mt-1">إدارة جميع منتجات المتجر والمخزون</p>
            </div>

            <div className="flex gap-2">
              <Link href="/admin/products/new">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]">
                  <Plus className="h-5 w-5 ml-2" />
                  إضافة منتج جديد
                </Button>
              </Link>
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedProducts.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">
                  {selectedProducts.length}
                </div>
                <span className="text-sm font-medium text-blue-900">منتجات محددة</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 bg-white border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                    إجراءات
                    <ChevronDown className="mr-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleBulkAction('display')} className="cursor-pointer">
                    <Check className="ml-2 h-4 w-4 text-green-600" />
                    عرض للبيع
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('hide')} className="cursor-pointer">
                    <Square className="ml-2 h-4 w-4 text-gray-500" />
                    إخفاء
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50">
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Products Table Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-4 w-12 text-center">
                      <button
                        onClick={handleSelectAll}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        {products.length > 0 && selectedProducts.length === products.length ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">المنتج</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">الفئة</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">السعر</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">المخزون</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 flex flex-col items-center justify-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                          <Plus className="w-6 h-6 text-gray-300" />
                        </div>
                        <p>لا توجد منتجات متاحة</p>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const productId = (product as any)._id || (product as any).id;
                      const isSelected = selectedProducts.includes(productId);
                      const categoryId = (product as any).categoryId;
                      const category = categories.find((c) => {
                        const catId = (c as any)._id || (c as any).id;
                        return String(catId) === String(categoryId);
                      });
                      return (
                        <tr
                          key={productId}
                          className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${isSelected ? 'bg-blue-50/30' : ''}`}
                          onClick={() => setLocation(`/admin/products/${productId}`)}
                        >
                          <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleSelectProduct(productId)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                {(product as any).image ? (
                                  <img src={(product as any).image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                                )}
                              </div>
                              <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors block">
                                {product.name || "بدون اسم"}
                                {(product as any).productCode && (
                                  <span className="block text-xs text-gray-400 font-normal mt-0.5">{(product as any).productCode}</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              {category?.name || "غير محدد"}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-medium text-gray-900">
                            {parseFloat(String(product.price || 0)).toFixed(2)} <span className="text-xs text-gray-500 font-normal">د.ل</span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {product.stock > 0 ? (
                              <span className="text-gray-900 font-medium">{product.stock}</span>
                            ) : (
                              <span className="text-red-500 font-medium">نفذت</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {(() => {
                              const status = product.status;
                              let statusClass = "bg-green-50 text-green-700 border border-green-100";
                              let dotClass = "bg-green-500";
                              let statusText = "معروض";

                              // Hidden/Unavailable products
                              if (status === 'hidden' || status === 'unavailable') {
                                statusClass = "bg-gray-50 text-gray-700 border border-gray-100";
                                dotClass = "bg-gray-500";
                                statusText = "غير معروض";
                              }

                              return (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotClass}`}></span>
                                  {statusText}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(Number(productId));
                                }}
                                title="حذف"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
