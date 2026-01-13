import React, { useState } from "react";
import { ArrowRight, Save, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import RichTextEditor from "../../components/RichTextEditor";
import ImageUploader from "../../components/ImageUploader";
import ProductOptionsManager, { ProductOption } from "../../components/ProductOptionsManager";
import { useForm } from "react-hook-form";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";

// تعريف أنواع البيانات
interface ProductFormData {
  name: string;
  description: string;
  productCode: string;
  quantity: number;
  minQuantity: number;
  originalPrice: number;
  costPrice: number;
  salePrice: number;
  discount: number;
  active: boolean;
  categoryId: string; // سيتم جلبها من API
  offerEndTime?: string;
  showActiveOffer?: boolean;
  lowStockThreshold?: number;
  // images: File[]; // سيتم التعامل معها بشكل منفصل
  // options: ProductOption[]; // سيتم التعامل معها بشكل منفصل
}

const AdminProductNew: React.FC = () => {
  const [, setLocation] = useLocation();
  const { register, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm<ProductFormData>();
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [productImages, setProductImages] = useState<File[]>([]);
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [videoType, setVideoType] = useState<"link" | "upload">("link");
  const [videoLink, setVideoLink] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // جلب التصنيفات
  const { data: categories = [], refetch: refetchCategories } = trpc.categories.list.useQuery();

  // حساب نسبة التخفيض
  const originalPrice = watch("originalPrice") || 0;
  const salePrice = watch("salePrice") || 0;
  const discountAmount = originalPrice - salePrice;
  const discountPercentage = originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0;

  const utils = trpc.useUtils();
  // API لإنشاء المنتج
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: (data) => {
      console.log("تم إنشاء المنتج بنجاح:", data);
      toast.success("✅ تم إضافة المنتج بنجاح!");
      // Invalidate products cache to refresh the list
      utils.products.all.invalidate();
      // إعادة التوجيه إلى صفحة المنتجات بعد ثانية واحدة
      setTimeout(() => {
        setLocation("/admin/products");
      }, 1000);
    },
    onError: (error: any) => {
      console.error("خطأ في إضافة المنتج:", error);
      toast.error(`❌ خطأ في الإضافة: ${error.message || "حدث خطأ غير متوقع"}`);
    },
  });

  // API لإنشاء تصنيف جديد
  const createCategoryMutation = trpc.categories.create.useMutation({
    onSuccess: async (data) => {
      console.log("تم إنشاء التصنيف بنجاح:", data);
      toast.success("✅ تم إضافة التصنيف بنجاح!");
      // تحديث قائمة التصنيفات
      await refetchCategories();
      // اختيار التصنيف الجديد تلقائياً
      const categoryData = data as { _id?: string; id?: string | number };
      const newCategoryId = categoryData._id || categoryData.id;
      if (newCategoryId) {
        setValue("categoryId", String(newCategoryId));
      }
      // إغلاق النموذج وإعادة تعيين الحقل
      setShowNewCategoryForm(false);
      setNewCategoryName("");
    },
    onError: (error: any) => {
      console.error("خطأ في إضافة التصنيف:", error);
      console.error("تفاصيل الخطأ:", {
        message: error.message,
        code: error.code,
        data: error.data,
        shape: error.shape,
      });

      // رسائل خطأ أكثر وضوحاً
      let errorMessage = "حدث خطأ غير متوقع";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.data?.code === "UNAUTHORIZED" || error.data?.code === "FORBIDDEN") {
        errorMessage = "ليس لديك صلاحية لإضافة تصنيف. يرجى تسجيل الدخول كمسؤول.";
      } else if (error.data?.code === "BAD_REQUEST") {
        errorMessage = "البيانات المرسلة غير صحيحة";
      } else if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
        errorMessage = "هذا التصنيف موجود بالفعل. يرجى اختيار اسم آخر.";
      }

      toast.error(`❌ خطأ في إضافة التصنيف: ${errorMessage}`);
    },
  });

  const handleCreateCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast.error("❌ يرجى إدخال اسم التصنيف");
      return;
    }

    console.log("محاولة إنشاء تصنيف جديد:", trimmedName);
    createCategoryMutation.mutate({
      name: trimmedName,
    });
  };

  const onSubmit = async (data: ProductFormData) => {
    // معالجة الفيديو
    let videoData = "";
    if (videoType === "link") {
      videoData = videoLink;
    } else if (videoType === "upload" && videoFile) {
      // تحويل الفيديو إلى Base64
      const reader = new FileReader();
      videoData = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(videoFile);
      });
    }

    // تحويل البيانات إلى الشكل المتوقع من API
    const productData = {
      name: data.name,
      description: descriptionHtml || data.description || "",
      productCode: data.productCode,
      categoryId: data.categoryId, // MongoDB ObjectId string
      price: Number(data.salePrice), // يجب أن يكون number
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      costPrice: data.costPrice ? Number(data.costPrice) : undefined,
      salePrice: Number(data.salePrice),
      stock: data.quantity || 0,
      minQuantity: data.minQuantity || 0,
      discount: isDiscountActive && data.originalPrice ? (Number(data.originalPrice) - Number(data.salePrice)) : 0,
      active: data.active !== false,
      status: data.active ? "displayed" : "hidden" as const,
      offerEndTime: data.offerEndTime ? new Date(data.offerEndTime) : undefined,
      showActiveOffer: data.showActiveOffer,
      lowStockThreshold: data.lowStockThreshold || 5,
      video: videoData || undefined,
      // images: سيتم إضافتها لاحقاً عند رفع الصور
      // options: خيارات المنتج (سيتم إرسالها إذا كانت موجودة)
      ...(productOptions.length > 0 && { options: productOptions }),
    };

    console.log("إرسال بيانات المنتج:", productData);
    createProductMutation.mutate(productData as any);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={() => setLocation("/admin/products")}
              className="h-10 w-10 shrink-0"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                إضافة منتج جديد
              </h1>
              <p className="text-sm text-gray-500">إدخال تفاصيل منتج جديد إلى المخزون</p>
            </div>
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4 ml-2" /> حفظ
            </button>
            <Link
              href="/admin/products"
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 ml-2" /> إلغاء
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* العمود الأيمن: التفاصيل الأساسية */}
          <div className="lg:col-span-2 space-y-6">
            {/* بطاقة التفاصيل الأساسية */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">التفاصيل الأساسية</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">اسم المنتج</label>
                <input
                  type="text"
                  {...register("name", { required: "اسم المنتج مطلوب" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">وصف المنتج</label>
                <RichTextEditor onChange={setDescriptionHtml} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">كود المنتج</label>
                <input
                  type="text"
                  {...register("productCode", { required: "كود المنتج مطلوب" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.productCode && <p className="text-red-500 text-xs mt-1">{errors.productCode.message}</p>}
              </div>
            </div>

            {/* بطاقة الصور */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">الصور</h2>
              <ImageUploader onFilesChange={setProductImages} maxFiles={10} />
            </div>

            {/* بطاقة الفيديو */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">فيديو المنتج</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="videoType"
                      value="link"
                      checked={videoType === "link"}
                      onChange={() => setVideoType("link")}
                      className="h-4 w-4 text-indigo-600 ml-2"
                    />
                    <span className="text-sm text-gray-700">رابط خارجي (YouTube/Vimeo)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="videoType"
                      value="upload"
                      checked={videoType === "upload"}
                      onChange={() => setVideoType("upload")}
                      className="h-4 w-4 text-indigo-600 ml-2"
                    />
                    <span className="text-sm text-gray-700">رفع فيديو (ملف صغير)</span>
                  </label>
                </div>

                {videoType === "link" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">رابط الفيديو</label>
                    <input
                      type="text"
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">اختر ملف الفيديو</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          if (file.size > 10 * 1024 * 1024) { // 10MB limit check
                            toast.error("❌ حجم الفيديو كبير جداً. يرجى استخدام رابط خارجي أو ملف أصغر من 10 ميجابايت.");
                            return;
                          }
                          setVideoFile(file);
                        }
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">يجب أن يكون حجم الفيديو أقل من 10 ميجابايت.</p>
                  </div>
                )}
              </div>
            </div>

            {/* بطاقة التسعير */}
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
              <h2 className="text-lg font-semibold border-b pb-2">التسعير</h2>

              {/* الصف الأول: الأسعار والتخفيض */}
              <div className="flex flex-wrap items-end gap-6">

                {/* السعر الأصلي */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isDiscountActive ? "السعر الأصلي" : "السعر الأصلي (غير مفعل)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isDiscountActive}
                    placeholder={!isDiscountActive ? "فعل التخفيض لإضافة سعر أصلي" : ""}
                    {...register("originalPrice", { valueAsNumber: true })}
                    className={`block w-full border rounded-md shadow-sm p-2 ${!isDiscountActive ? "bg-gray-100 text-gray-400 border-gray-200" : "border-gray-300"}`}
                  />
                </div>

                {/* سعر التخفيض / البيع */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isDiscountActive ? "سعر التخفيض" : "السعر"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("salePrice", { valueAsNumber: true, required: "سعر البيع مطلوب" })}
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2 font-bold text-gray-900"
                  />
                </div>

                {/* خيار التخفيض */}
                <div className="flex items-center h-[42px]">
                  <label className="flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isDiscountActive}
                      onChange={(e) => {
                        setIsDiscountActive(e.target.checked);
                        if (e.target.checked) {
                          // عند تفعيل التخفيض، انسخ السعر الحالي إلى السعر الأصلي
                          const currentPrice = getValues("salePrice");
                          if (currentPrice) setValue("originalPrice", currentPrice);
                        } else {
                          // عند إلغاء التخفيض، نظف السعر الأصلي
                          setValue("originalPrice", 0);
                        }
                      }}
                      className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ml-2"
                    />
                    <span className="text-sm font-medium text-gray-700">تخفيض</span>
                  </label>
                </div>
              </div>

              {/* تفاصيل العرض (تظهر فقط عند التفعيل) */}
              {isDiscountActive && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">تاريخ انتهاء العرض</label>
                    <input
                      type="datetime-local"
                      {...register("offerEndTime")}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-1.5 text-sm"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <input
                      type="checkbox"
                      id="show-active-offer"
                      {...register("showActiveOffer")}
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded ml-2"
                    />
                    <label htmlFor="show-active-offer" className="text-xs font-medium text-gray-700">
                      عرض في قسم "عروض خاصة"
                    </label>
                  </div>
                </div>
              )}

              {/* الصف الثاني: التكلفة والأرباح */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
                {/* سعر التكلفة */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">سعر التكلفة</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("costPrice", { valueAsNumber: true })}
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">سعر التكلفة لن يظهر للزبون</p>
                </div>

                {/* إحصائيات الربح */}
                <div className="flex flex-col justify-end pb-1">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1 px-1">
                    <span>الربح</span>
                    <span>الهامش</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md p-3">
                    <span className="font-bold text-gray-800 text-lg">
                      LYD {((watch("salePrice") || 0) - (watch("costPrice") || 0)).toFixed(2)}
                    </span>
                    <span className={`font-bold text-lg ${((watch("salePrice") || 0) - (watch("costPrice") || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      %{watch("salePrice") > 0
                        ? ((((watch("salePrice") || 0) - (watch("costPrice") || 0)) / (watch("salePrice") || 0)) * 100).toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>


            {/* بطاقة خيارات المنتج */}
            < div className="bg-white p-6 rounded-lg shadow space-y-4" >
              <h2 className="text-lg font-semibold border-b pb-2">خيارات المنتج</h2>
              <ProductOptionsManager
                options={productOptions}
                onChange={setProductOptions}
              />
            </div >
          </div >

          {/* العمود الأيسر: الإعدادات والمخزون */}
          < div className="lg:col-span-1 space-y-6" >
            {/* بطاقة حالة المنتج والتصنيف */}
            < div className="bg-white p-6 rounded-lg shadow space-y-4" >
              <h2 className="text-lg font-semibold border-b pb-2">حالة المنتج والتصنيف</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">حالة المنتج</label>
                <select
                  {...register("active")}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="true">معروض</option>
                  <option value="false">غير معروض</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">التصنيف</label>
                <select
                  {...register("categoryId", { required: "التصنيف مطلوب" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  disabled={showNewCategoryForm}
                >
                  <option value="">اختر تصنيفاً</option>
                  {categories?.map((cat) => {
                    const categoryId = (cat as any)._id || (cat as any).id;
                    const categoryName = (cat as any).name || "";
                    return (
                      <option key={categoryId} value={String(categoryId)}>
                        {categoryName}
                      </option>
                    );
                  })}
                </select>
                {!showNewCategoryForm ? (
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryForm(true)}
                    className="text-sm text-indigo-600 mt-2 hover:text-indigo-800 flex items-center"
                  >
                    <span className="ml-1">+</span> تصنيف جديد
                  </button>
                ) : (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم التصنيف الجديد</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="أدخل اسم التصنيف"
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2 mb-2"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateCategory();
                        } else if (e.key === "Escape") {
                          setShowNewCategoryForm(false);
                          setNewCategoryName("");
                        }
                      }}
                    />
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                        className="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createCategoryMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryForm(false);
                          setNewCategoryName("");
                        }}
                        className="flex-1 px-3 py-1.5 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
              </div>
            </div >

            {/* بطاقة المخزون */}
            < div className="bg-white p-6 rounded-lg shadow space-y-4" >
              <h2 className="text-lg font-semibold border-b pb-2">المخزون</h2>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="stockType" defaultChecked className="h-4 w-4 text-indigo-600" />
                  <span className="mr-2 text-sm text-gray-700">تسليم فوري</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="stockType" disabled className="h-4 w-4 text-indigo-600" />
                  <span className="mr-2 text-sm text-gray-700">بالحجز (قريباً)</span>
                </label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" id="unlimited-stock" className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                <label htmlFor="unlimited-stock" className="text-sm text-gray-700">
                  الكمية غير محدودة
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">الكمية الحالية</label>
                <input
                  type="number"
                  {...register("quantity", { valueAsNumber: true, required: "الكمية مطلوبة" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">حد التنبيه للمخزون</label>
                <input
                  type="number"
                  {...register("minQuantity", { valueAsNumber: true, required: "حد التنبيه مطلوب" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">تنبيه ندرة المخزون (للعملاء)</label>
                <input
                  type="number"
                  defaultValue={5}
                  {...register("lowStockThreshold", { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <p className="text-xs text-gray-500 mt-1">سيظهر "باقي X قطع فقط" عندما يقل المخزون عن هذا الرقم</p>
              </div>
            </div >
          </div >
        </div >
      </form >
    </div >
  );
};

export default AdminProductNew;
