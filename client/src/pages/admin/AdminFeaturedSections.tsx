import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Store, Plus, X, Search, Check, Trash2, Edit, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminFeaturedSections() {
    const [location, setLocation] = useLocation();
    const [isSaving, setIsSaving] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [currentSection, setCurrentSection] = useState({ title: "", products: [] as string[] });

    useEffect(() => {
        const isAdmin = localStorage.getItem("adminToken");
        if (!isAdmin) {
            setLocation("/admin/login");
        }
    }, [setLocation]);

    const { data: settings, isLoading, refetch } = trpc.storeSettings.get.useQuery();
    const { data: productsList } = trpc.products.list.useQuery({ limit: 1000 });
    const updateSettings = trpc.storeSettings.update.useMutation();

    const [featuredSections, setFeaturedSections] = useState<{ title: string; products: string[] }[]>([]);

    useEffect(() => {
        if (settings) {
            setFeaturedSections(settings.featuredSections?.map((section: any) => ({
                title: section.title,
                products: section.products.map((p: any) => p.toString())
            })) || []);
        }
    }, [settings]);

    const saveChanges = async () => {
        setIsSaving(true);
        try {
            await updateSettings.mutateAsync({
                ...settings, // Keep other settings
                // Force toObject if needed or just use properties from settings which should be an object
                storeName: settings?.storeName || "",
                storeDescription: settings?.storeDescription || "",
                storeLogo: settings?.storeLogo || "",
                favicon: settings?.favicon || "",
                banners: settings?.banners || [],
                socialMedia: settings?.socialMedia || {},
                footer: settings?.footer || {},
                featuredSections: featuredSections
            } as any);
            toast.success("تم حفظ أقسام الصفحة الرئيسية بنجاح");
            refetch();
        } catch (error) {
            toast.error("فشل حفظ التغييرات");
            console.error("Error saving featured sections:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!localStorage.getItem("adminToken")) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <AdminSidebar activePath="/admin/featured-sections" />
                <div className="lg:mr-72 lg:p-8 ml-0 p-4">
                    <div className="text-center">جاري التحميل...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <AdminSidebar activePath="/admin/featured-sections" />

            <div className="lg:mr-72 lg:p-8 ml-0 p-4">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/settings">
                            <Button variant="ghost" size="icon">
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Store className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl font-bold">أقسام الصفحة الرئيسية</h1>
                        </div>
                    </div>
                    {/* زر الحفظ */}
                    <Button
                        onClick={saveChanges}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                    >
                        {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* أقسام الصفحة الرئيسية */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold">إدارة الأقسام</h2>
                                <p className="text-gray-500 text-sm">قم بإنشاء وتخصيص أقسام لعرض منتجاتك (مثلاً: واجهة المتجر، الأكثر مبيعاً، خصومات خاصة).</p>
                            </div>
                            {!isAddingSection && editingSectionIndex === null && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setCurrentSection({ title: "", products: [] });
                                        setIsAddingSection(true);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                >
                                    <Plus className="h-4 w-4" /> إضافة قسم
                                </Button>
                            )}
                        </div>

                        {/* قائمة الأقسام */}
                        {!isAddingSection && editingSectionIndex === null && (
                            <div className="space-y-4">
                                {featuredSections.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Store className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-900 font-medium mb-1">لا توجد أقسام مضافة</p>
                                        <p className="text-gray-500 text-sm mb-4">أضف أقساماً لعرض منتجاتك في الصفحة الرئيسية</p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setCurrentSection({ title: "", products: [] });
                                                setIsAddingSection(true);
                                            }}
                                        >
                                            إضافة أول قسم
                                        </Button>
                                    </div>
                                ) : (
                                    featuredSections.map((section, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{section.title}</h3>
                                                    <p className="text-sm text-gray-500">{section.products.length} منتجات مختارة</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setCurrentSection(section);
                                                        setEditingSectionIndex(index);
                                                    }}
                                                    className="h-9 w-9 p-0 rounded-full hover:bg-blue-50 text-gray-500 hover:text-blue-600"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newSections = featuredSections.filter((_, i) => i !== index);
                                                        setFeaturedSections(newSections);
                                                    }}
                                                    className="h-9 w-9 p-0 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* محرر القسم (إضافة/تعديل) */}
                        {(isAddingSection || editingSectionIndex !== null) && (
                            <div className="border-2 border-blue-100 rounded-xl p-6 bg-blue-50/30 animate-in fade-in zoom-in duration-200">
                                <div className="flex justify-between items-center mb-6 border-b border-blue-100 pb-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
                                            {isAddingSection ? <Plus className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                                        </span>
                                        {isAddingSection ? "إضافة قسم جديد" : "تعديل محتوى القسم"}
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setIsAddingSection(false);
                                            setEditingSectionIndex(null);
                                        }}
                                        className="rounded-full hover:bg-red-50 hover:text-red-500"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {/* عنوان القسم */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            عنوان القسم <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={currentSection.title}
                                            onChange={(e) => setCurrentSection({ ...currentSection, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                            placeholder="مثلاً: المنتجات المخفضة، شاشات، الأكثر طلباً..."
                                            autoFocus
                                        />
                                    </div>

                                    {/* اختيار المنتجات */}
                                    <div>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <label className="block text-sm font-bold text-gray-700">
                                                اختر المنتجات <span className="text-blue-600 text-xs font-normal">({currentSection.products.length} تم اختيارها)</span>
                                            </label>
                                            {currentSection.products.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentSection({ ...currentSection, products: [] })}
                                                    className="text-xs text-red-500 hover:text-red-700 hover:underline"
                                                >
                                                    إلغاء الكل
                                                </button>
                                            )}
                                        </div>

                                        <div className="mb-3 relative">
                                            <input
                                                type="text"
                                                placeholder="ابحث عن منتج بالاسم لإضافته..."
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                            />
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        </div>

                                        <div className="border rounded-xl max-h-72 overflow-y-auto bg-white shadow-inner">
                                            {productsList
                                                ?.filter((p: any) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                                .map((product: any) => {
                                                    const isSelected = currentSection.products.includes(product._id || product.id);
                                                    return (
                                                        <div
                                                            key={product._id || product.id}
                                                            onClick={() => {
                                                                const pid = product._id || product.id;
                                                                const newProducts = isSelected
                                                                    ? currentSection.products.filter(id => id !== pid)
                                                                    : [...currentSection.products, pid];
                                                                setCurrentSection({ ...currentSection, products: newProducts });
                                                            }}
                                                            className={`flex items-center gap-3 p-3 border-b last:border-0 cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 scale-110' : 'border-gray-300 bg-white'}`}>
                                                                {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                                            </div>
                                                            {product.image ? (
                                                                <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md border" />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-[10px] text-gray-500">لا صورة</div>
                                                            )}
                                                            <div className="flex-1">
                                                                <p className={`text-sm ${isSelected ? 'font-bold text-blue-800' : 'text-gray-700'}`}>{product.name}</p>
                                                                <p className="text-xs text-gray-500">{product.price} د.ل</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            {productsList?.length === 0 && (
                                                <div className="p-8 text-center text-gray-400">لا توجد منتجات في المتجر</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* أزرار الحفظ/الإلغاء */}
                                    <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => {
                                                setIsAddingSection(false);
                                                setEditingSectionIndex(null);
                                            }}
                                            className="text-gray-600 hover:bg-gray-100"
                                        >
                                            إلغاء التغييرات
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                if (!currentSection.title.trim()) {
                                                    toast.error("يرجى إدخال عنوان للقسم");
                                                    return;
                                                }

                                                const newSections = [...featuredSections];
                                                if (isAddingSection) {
                                                    newSections.push(currentSection);
                                                } else if (editingSectionIndex !== null) {
                                                    newSections[editingSectionIndex] = currentSection;
                                                }

                                                setFeaturedSections(newSections);
                                                setIsAddingSection(false);
                                                setEditingSectionIndex(null);
                                                setProductSearch("");
                                                toast.success(isAddingSection ? "تم إضافة القسم للقائمة (اضغط حفظ التغييرات)" : "تم تحديث القسم (اضغط حفظ التغييرات)");
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-lg shadow-blue-200"
                                        >
                                            {isAddingSection ? "إضافة القسم للقائمة" : "تحديث القسم"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
