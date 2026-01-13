# استخدام ConfirmDialog - دليل التطبيق

## المكونات الجديدة

### 1. `ConfirmDialog.tsx`
نافذة تأكيد احترافية مع:
- ✅ لوغو المتجر
- ✅ تصميم جميل
- ✅ Backdrop blur
- ✅ Animations
- ✅ ثلاثة أنواع: danger, warning, info
- ✅ إغلاق بـ ESC
- ✅ عناصر زخرفية

### 2. `useConfirm.tsx`
Hook للاستخدام السهل مع Promise-based API

---

## طريقة الاستخدام

### مثال 1: في Admin Orders (حذف طلب)

```tsx
import { useConfirm } from "@/hooks/useConfirm";

export default function AdminOrders() {
  const { confirm, ConfirmDialog } = useConfirm();
  
  const handleDelete = async (orderId: string, orderNumber: string) => {
    const confirmed = await confirm({
      title: "حذف الطلب",
      message: `هل أنت متأكد من حذف الطلب ${orderNumber}؟`,
      confirmText: "حذف",
      cancelText: "إلغاء",
      type: "danger"
    });
    
    if (confirmed) {
      // تنفيذ الحذف
      deleteOrder.mutate({ id: orderId });
    }
  };
  
  return (
    <>
      {/* ... باقي المكونات ... */}
      
      <button onClick={() => handleDelete(order._id, order.orderNumber)}>
        <Trash2 />
      </button>
      
      {/* إضافة المكون */}
      <ConfirmDialog />
    </>
  );
}
```

### مثال 2: في Admin Products (حذف منتج)

```tsx
import { useConfirm } from "@/hooks/useConfirm";

export default function AdminProducts() {
  const { confirm, ConfirmDialog } = useConfirm();
  
  const handleDelete = async (productId: string, productName: string) => {
    const confirmed = await confirm({
      title: "حذف المنتج",
      message: `هل تريد حذف "${productName}"؟ لن تتمكن من التراجع عن هذا الإجراء.`,
      confirmText: "نعم، احذف",
      cancelText: "لا، إلغاء",
      type: "danger"
    });
    
    if (confirmed) {
      deleteProduct.mutate({ id: productId });
    }
  };
  
  return (
    <>
      {/* ... */}
      <ConfirmDialog />
    </>
  );
}
```

### مثال 3: تحديث حالة (warning)

```tsx
const handleStatusChange = async (orderId: string) => {
  const confirmed = await confirm({
    title: "تغيير حالة الطلب",
    message: "هل تريد تأكيد الطلب وإرساله للشحن؟",
    confirmText: "نعم، أكمل",
    cancelText: "إلغاء",
    type: "warning"
  });
  
  if (confirmed) {
    updateStatus.mutate({ id: orderId, status: "confirmed" });
  }
};
```

### مثال 4: معلومات عامة (info)

```tsx
const handleInfo = async () => {
  const confirmed = await confirm({
    title: "تصدير البيانات",
    message: "سيتم تصدير جميع الطلبات الحالية إلى ملف Excel. هل تريد المتابعة؟",
    confirmText: "نعم، صدّر",
    cancelText: "إلغاء",
    type: "info"
  });
  
  if (confirmed) {
    exportData();
  }
};
```

---

## الميزات

### التصميم
- **لوغو المتجر**: يظهر تلقائياً من `/logo.png`
- **ألوان ديناميكية**: حسب النوع (danger/warning/info)
- **Badge**: "يتطلب تأكيد" مع نقطة متحركة
- **Backdrop blur**: خلفية ضبابية احترافية

### التفاعل
- **ESC للإغلاق**: اضغط ESC للإلغاء
- **Click خارج النافذة**: للإغلاق
- **Animations**: fade-in و zoom-in
- **Active states**: تأثيرات عند الضغط

### الأنواع الثلاثة

#### Type: "danger" (الافتراضي)
- لون أحمر
- للعمليات الخطرة (حذف، إلغاء نهائي)

#### Type: "warning"
- لون برتقالي
- للعمليات المهمة (تحديث، تغيير حالة)

#### Type: "info"
- لون أزرق
- للمعلومات والإجراءات العادية

---

## الكود الأساسي

### الاستيراد
```tsx
import { useConfirm } from "@/hooks/useConfirm";
```

### الاستخدام
```tsx
const { confirm, ConfirmDialog } = useConfirm();

// في function
const result = await confirm({
  title: "العنوان",
  message: "الرسالة",
  confirmText: "تأكيد",
  cancelText: "إلغاء",
  type: "danger" // أو "warning" أو "info"
});

if (result) {
  // المستخدم ضغط تأكيد
} else {
  // المستخدم ضغط إلغاء
}

// في JSX
return <ConfirmDialog />;
```

---

## استبدال `window.confirm()`

### قبل:
```tsx
const handleDelete = (id: string) => {
  if (window.confirm("هل أنت متأكد؟")) {
    deleteItem(id);
  }
};
```

### بعد:
```tsx
const { confirm, ConfirmDialog } = useConfirm();

const handleDelete = async (id: string) => {
  if (await confirm({
    title: "حذف العنصر",
    message: "هل أنت متأكد من الحذف؟",
    type: "danger"
  })) {
    deleteItem(id);
  }
};

// في JSX
<ConfirmDialog />
```

---

## التخصيص

يمكنك تخصيص:
- `title`: العنوان
- `message`: الرسالة  
- `confirmText`: نص زر التأكيد (افتراضي: "تأكيد")
- `cancelText`: نص زر الإلغاء (افتراضي: "إلغاء")
- `type`: نوع النافذة (افتراضي: "danger")

---

## ملاحظات

1. **يجب إضافة `<ConfirmDialog />` في JSX** - لا تنسى!
2. **استخدم `await`** - لأن الدالة ترجع Promise
3. **اللوغو تلقائي** - يأخذ من `/logo.png`
4. **RTL Support** - يعمل مع العربية بشكل صحيح

---

**تاريخ الإنشاء**: 2026-01-04  
**الحالة**: جاهز للاستخدام ✅
