import React, { useState, useEffect } from "react";
import { ArrowRight, Save, X } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import RichTextEditor from "../../components/RichTextEditor";
import ImageUploader from "../../components/ImageUploader";
import ProductOptionsManager, { ProductOption } from "../../components/ProductOptionsManager";
import { useForm } from "react-hook-form";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";

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
    categoryId: string;
    offerEndTime?: string;
    showActiveOffer?: boolean;
    lowStockThreshold?: number;
}

const AdminProductEdit: React.FC = () => {
    const { id } = useParams();
    const [, setLocation] = useLocation();
    const { register, handleSubmit, setValue, watch, reset, getValues, formState: { errors } } = useForm<ProductFormData>();
    const [descriptionHtml, setDescriptionHtml] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [isDiscountActive, setIsDiscountActive] = useState(false);
    const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [videoType, setVideoType] = useState<"link" | "upload">("link");
    const [videoLink, setVideoLink] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);

    // Get categories
    const { data: categories = [], refetch: refetchCategories } = trpc.categories.list.useQuery();

    // Get product details
    const { data: product, isLoading } = trpc.products.getById.useQuery({ id: String(id) }, {
        enabled: !!id,
    });

    // Initialize form with product data when successfully fetched
    useEffect(() => {
        if (product) {
            reset({
                name: product.name,
                description: product.description,
                productCode: product.productCode || "",
                quantity: product.stock || 0,
                minQuantity: product.minQuantity || 0,
                originalPrice: product.originalPrice || 0,
                costPrice: product.costPrice || 0,
                salePrice: product.salePrice || 0,
                discount: product.discount || 0,
                active: product.status === "displayed" || product.status === "available" || product.status === "coming_soon",
                categoryId: String(product.categoryId),
                offerEndTime: product.offerEndTime ? new Date(product.offerEndTime).toISOString().slice(0, 16) : undefined,
                showActiveOffer: product.showActiveOffer || false,
                lowStockThreshold: product.lowStockThreshold || 5,
            });
            setDescriptionHtml(product.description || "");
            setIsDiscountActive(!!product.discount);
            if (product.options) {
                setProductOptions(product.options as ProductOption[]);
            }
            // Load images
            if (product.images && product.images.length > 0) {
                setImages(product.images);
            } else if (product.image) {
                setImages([product.image]);
            }
            // Load video
            if (product.video) {
                if (product.video.startsWith("http")) {
                    setVideoType("link");
                    setVideoLink(product.video);
                } else {
                    // It's likely base64 or stored path, treated as upload for display context, 
                    // though we can't restore file object easily, we keep it as link/data
                    // For editing, we usually show preview.
                    // For now, let's update link logic
                    setVideoType("link"); // Treat extended data as link source for preview
                    setVideoLink(product.video);
                }
            }
        }
    }, [product, reset]);

    // Calculate discount
    const originalPrice = watch("originalPrice") || 0;
    const salePrice = watch("salePrice") || 0;
    const discountAmount = originalPrice - salePrice;
    const discountPercentage = originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0;

    const utils = trpc.useUtils();
    const updateProductMutation = trpc.products.update.useMutation({
        onSuccess: () => {
            toast.success("✅ تم تحديث المنتج بنجاح!");
            // Invalidate products cache to refresh the list
            utils.products.all.invalidate();
            setTimeout(() => {
                setLocation("/admin/products");
            }, 1000);
        },
        onError: (error: any) => {
            toast.error(`❌ خطأ في التحديث: ${error.message || "حدث خطأ غير متوقع"}`);
        },
    });

    // API to create new category
    const createCategoryMutation = trpc.categories.create.useMutation({
        onSuccess: async (data) => {
            toast.success("✅ تم إضافة التصنيف بنجاح!");
            await refetchCategories();
            const categoryData = data as { _id?: string; id?: string | number };
            const newCategoryId = categoryData._id || categoryData.id;
            if (newCategoryId) {
                setValue("categoryId", String(newCategoryId));
            }
            setShowNewCategoryForm(false);
            setNewCategoryName("");
        },
        onError: (error: any) => {
            toast.error(`❌ خطأ في إضافة التصنيف: ${error.message || "حدث خطأ غير متوقع"}`);
        },
    });

    const handleCreateCategory = () => {
        const trimmedName = newCategoryName.trim();
        if (!trimmedName) {
            toast.error("❌ يرجى إدخال اسم التصنيف");
            return;
        }
        createCategoryMutation.mutate({ name: trimmedName });
    };

    const onSubmit = async (data: ProductFormData) => {
        if (!product) return;

        let videoData = product.video; // Keep existing value by default
        // If changed
        if (videoType === "link" && videoLink !== product.video) {
            videoData = videoLink;
        } else if (videoType === "upload" && videoFile) {
            const reader = new FileReader();
            videoData = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(videoFile);
            });
        }

        const productData = {
            id: product._id || product.id,
            name: data.name,
            description: descriptionHtml || data.description || "",
            productCode: data.productCode || undefined,
            categoryId: data.categoryId,
            price: Number(data.salePrice),
            originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
            costPrice: data.costPrice ? Number(data.costPrice) : undefined,
            salePrice: Number(data.salePrice),
            stock: data.quantity || 0,
            minQuantity: data.minQuantity || 0,
            status: String(data.active) === "true" ? "displayed" : "hidden" as const,
            active: String(data.active) === "true",
            image: images.length > 0 ? images[0] : "",
            images: images,
            discount: isDiscountActive && data.originalPrice ? (Number(data.originalPrice) - Number(data.salePrice)) : 0,
            offerEndTime: data.offerEndTime ? new Date(data.offerEndTime) : undefined,
            showActiveOffer: data.showActiveOffer,
            lowStockThreshold: data.lowStockThreshold,
            video: videoData,
            ...(productOptions.length > 0 && { options: productOptions }),
        };

        updateProductMutation.mutate(productData as any);
    };

    if (isLoading) return <div className="p-6 text-center">جاري التحميل...</div>;
    if (!product) return <div className="p-6 text-center">المنتج غير موجود</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                {product.name}
                            </h1>
                            <p className="text-sm text-gray-500">تعديل تفاصيل المنتج</p>
                        </div>
                    </div>

                    <div className="flex space-x-2 space-x-reverse">
                        <button
                            type="submit"
                            disabled={updateProductMutation.isPending}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 ml-2" /> حفظ التغييرات
                        </button>
                        <Link
                            href="/admin/products"
                            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4 ml-2" /> إلغاء
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">التفاصيل الأساسية</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">اسم المنتج</label>
                                <input
                                    type="text"
                                    {...register("name", { required: "اسم المنتج مطلوب" })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">وصف المنتج</label>
                                <RichTextEditor initialHtml={descriptionHtml} onChange={setDescriptionHtml} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">كود المنتج</label>
                                <input
                                    type="text"
                                    {...register("productCode")}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                        </div>

                        {/* الصور */}
                        <div className="bg-white p-6 rounded-lg shadow space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">الصور ({images.length})</h2>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                            src={img}
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        {index === 0 && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs text-center py-1 bg-opacity-80">
                                                الصورة الرئيسية
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-500 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p className="text-sm text-gray-500 font-semibold">اضغط لإضافة صور</p>
                                        <p className="text-xs text-gray-400 mt-1">(الحد الأقصى 10 صور)</p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                const files = Array.from(e.target.files);

                                                if (images.length + files.length > 10) {
                                                    toast.error("❌ الحد الأقصى للصور هو 10 صور");
                                                    return;
                                                }

                                                const promises = files.map(file => new Promise<string>((resolve) => {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => resolve(reader.result as string);
                                                    reader.readAsDataURL(file);
                                                }));
                                                const newImages = await Promise.all(promises);
                                                setImages([...images, ...newImages]);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">الصورة الأولى ستكون هي الصورة الرئيسية للمنتج.</p>
                        </div>

                        {/* الفيديو */}
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

                        {/* التسعير */}
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
                                                    const currentPrice = getValues("salePrice");
                                                    if (currentPrice) setValue("originalPrice", currentPrice);
                                                } else {
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

                        {/* خيارات المنتج */}
                        <div className="bg-white p-6 rounded-lg shadow space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">خيارات المنتج</h2>
                            <ProductOptionsManager
                                options={productOptions}
                                onChange={setProductOptions}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        {/* الحالة والتصنيف */}
                        <div className="bg-white p-6 rounded-lg shadow space-y-4">
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
                                    {categories.map((cat: any) => (
                                        <option key={cat._id || cat.id} value={String(cat._id || cat.id)}>
                                            {cat.name}
                                        </option>
                                    ))}
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
                            </div>
                        </div>

                        {/* المخزون */}
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
                                <label className="block text-sm font-medium text-gray-700">الكمية</label>
                                <input
                                    type="number"
                                    {...register("quantity", { valueAsNumber: true })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">حد التنبيه للمخزون</label>
                                <input
                                    type="number"
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
                        </div>
                    </div>
                </div >
            </form >
        </div >
    );
};

export default AdminProductEdit;
