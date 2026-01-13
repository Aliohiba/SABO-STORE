import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Plus, Edit2, Trash2, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminCategories() {
    const [, setLocation] = useLocation();

    useEffect(() => {
        const isAdmin = localStorage.getItem("adminToken");
        if (!isAdmin) {
            setLocation("/admin/login");
        }
    }, [setLocation]);

    const { data: categories = [], refetch } = trpc.categories.list.useQuery();
    const createCategory = trpc.categories.create.useMutation();
    const updateCategory = trpc.categories.update.useMutation();
    const deleteCategory = trpc.categories.delete.useMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: "",
    });
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error("يرجى إدخال اسم التصنيف");
            return;
        }

        if (isEditing && currentId) {
            updateCategory.mutate(
                { id: currentId, ...formData },
                {
                    onSuccess: () => {
                        toast.success("تم تحديث التصنيف بنجاح");
                        resetForm();
                        refetch();
                    },
                }
            );
        } else {
            createCategory.mutate(
                formData,
                {
                    onSuccess: () => {
                        toast.success("تم إنشاء التصنيف بنجاح");
                        resetForm();
                        refetch();
                    },
                }
            );
        }
    };

    const handleEdit = (category: any) => {
        setFormData({
            name: category.name,
            description: category.description || "",
            image: category.image || "",
        });
        setCurrentId(category.id || category._id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("هل أنت متأكد من حذف هذا التصنيف؟")) {
            deleteCategory.mutate(
                { id },
                {
                    onSuccess: () => {
                        toast.success("تم حذف التصنيف بنجاح");
                        refetch();
                    },
                }
            );
        }
    };

    const resetForm = () => {
        setFormData({ name: "", description: "", image: "" });
        setIsEditing(false);
        setCurrentId(null);
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <AdminSidebar activePath="/admin/categories" />

            <div className="lg:mr-72 lg:p-8 p-4 ml-0">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/settings">
                            <Button variant="ghost" size="icon">
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">إدارة التصنيفات</h1>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Plus className="h-5 w-5" />
                        إضافة تصنيف
                    </Button>
                </div>

                {showForm && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8 animate-in fade-in slide-in-from-top-4">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? "تعديل التصنيف" : "تصنيف جديد"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم التصنيف</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="مثال: إلكترونيات"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">وصف (اختياري)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="وصف مختصر للتصنيف"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">صورة التصنيف (اختياري)</label>
                                <div className="flex items-center gap-4">
                                    {formData.image && (
                                        <div className="w-16 h-16 border rounded overflow-hidden">
                                            <img src={formData.image} alt="Category" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({ ...formData, image: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {formData.image && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500"
                                            onClick={() => setFormData({ ...formData, image: "" })}
                                        >
                                            إزالة
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={resetForm}>إلغاء</Button>
                                <Button type="submit" className="bg-blue-600 text-white">{isEditing ? "حفظ التغييرات" : "إضافة"}</Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category: any) => (
                        <div key={category.id || category._id} className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                                {category.image ? (
                                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-grow">
                                <h3 className="font-bold text-lg">{category.name}</h3>
                                {category.description && <p className="text-gray-500 text-sm">{category.description}</p>}
                                <p className="text-xs text-gray-400 mt-1">ID: {category.id || category._id}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                                    <Edit2 className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id || category._id)}>
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            لا توجد تصنيفات مضافة بعد
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
