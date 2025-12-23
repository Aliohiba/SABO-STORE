import React, { useState } from "react";
import { ArrowRight, Save, X } from "lucide-react";
import { Link } from "react-router-dom";
import RichTextEditor from "../../components/RichTextEditor";
import ImageUploader from "../../components/ImageUploader";
import { useForm } from "react-hook-form";
import { trpc } from "../../utils/trpc";
import { toast } from "react-toastify";

// تعريف أنواع البيانات
interface ProductFormData {
  name: string;
  description: string;
  productCode: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  salePrice: number;
  discount: number;
  active: boolean;
  categoryId: string; // سيتم جلبها من API
  // images: File[]; // سيتم التعامل معها بشكل منفصل
  // options: ProductOption[]; // سيتم التعامل معها بشكل منفصل
}

const AdminProductNew: React.FC = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>();
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [productImages, setProductImages] = useState<File[]>([]);
  const [isDiscountActive, setIsDiscountActive] = useState(false);

  // جلب التصنيفات
  const { data: categories } = trpc.category.getAll.useQuery();

  // حساب هامش الربح
  const costPrice = watch("costPrice") || 0;
  const salePrice = watch("salePrice") || 0;
  const profit = salePrice - costPrice;
  const profitPercentage = costPrice > 0 ? (profit / costPrice) * 100 : 0;

  // API لإنشاء المنتج
  const createProductMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      toast.success("✅ تم إضافة المنتج بنجاح!");
      // يمكن إضافة إعادة توجيه هنا
    },
    onError: (error) => {
      toast.error(`❌ خطأ في الإضافة: ${error.message}`);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    // يجب التعامل مع رفع الصور هنا قبل إرسال البيانات
    // حالياً سنرسل البيانات النصية فقط
    const productData = {
      ...data,
      description: descriptionHtml,
      // يجب إضافة معالجة للصور والخيارات هنا
    };
    
    createProductMutation.mutate(productData as any);
    // console.log("بيانات المنتج للإرسال:", productData);
    // toast.info("تمت محاكاة الإرسال بنجاح. يجب إضافة منطق رفع الصور.");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <ArrowRight className="w-5 h-5 ml-2" /> منتج جديد
          </h1>
          <div className="flex space-x-2 space-x-reverse">
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4 ml-2" /> حفظ
            </button>
            <Link
              to="/admin/products"
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
              <ImageUploader onFilesChange={setProductImages} maxFiles={5} />
            </div>

            {/* بطاقة التسعير */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">التسعير</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">سعر التكلفة</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("costPrice", { valueAsNumber: true, required: "سعر التكلفة مطلوب" })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">سعر التكلفة لن يظهر للزبون</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">سعر البيع</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("salePrice", { valueAsNumber: true, required: "سعر البيع مطلوب" })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-700">هامش الربح</p>
                <p className="text-lg font-bold text-green-600">{profit.toFixed(2)}</p>
                <p className="text-sm font-medium text-gray-700">النسبة</p>
                <p className="text-lg font-bold text-green-600">{profitPercentage.toFixed(2)}%</p>
              </div>
              
              {/* التخفيض */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="discount-toggle"
                  checked={isDiscountActive}
                  onChange={(e) => setIsDiscountActive(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="discount-toggle" className="text-sm font-medium text-gray-700">
                  تخفيض
                </label>
              </div>
              {isDiscountActive && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">قيمة التخفيض (بالعملة أو النسبة)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("discount", { valueAsNumber: true })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              )}
            </div>

            {/* بطاقة خيارات المنتج */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">خيارات المنتج</h2>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="has-options"
                  // يجب ربطها بمنطق الخيارات
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="has-options" className="text-sm font-medium text-gray-700">
                  يحتوي هذا المنتج على خيارات متعددة. مثل أحجام وألوان مختلفة.
                </label>
              </div>
              {/* هنا سيتم إضافة مكون إدارة الخيارات لاحقاً */}
            </div>
          </div>

          {/* العمود الأيسر: الإعدادات والمخزون */}
          <div className="lg:col-span-1 space-y-6">
            {/* بطاقة حالة المنتج والتصنيف */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">حالة المنتج والتصنيف</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">حالة المنتج</label>
                <select
                  {...register("active")}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="true">معروض للبيع</option>
                  <option value="false">موقوف</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">التصنيف</label>
                <select
                  {...register("categoryId", { required: "التصنيف مطلوب" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">اختر تصنيفاً</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button type="button" className="text-sm text-indigo-600 mt-2 hover:text-indigo-800">
                  + تصنيف جديد
                </button>
              </div>
            </div>

            {/* بطاقة المخزون */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
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
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductNew;
