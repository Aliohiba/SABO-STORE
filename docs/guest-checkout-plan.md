# Guest Checkout Implementation Plan

## المشكلة الحالية
النظام الحالي يتطلب تسجيل دخول للوصول إلى:
- ❌ السلة (Cart)
- ❌ صفحة الدفع (Checkout)
- ❌ إضافة منتجات للسلة

## الحل المطلوب
السماح للضيوف (Guest Users) بـ:
- ✅ إضافة منتجات للسلة بدون تسجيل
- ✅ الوصول لصفحة الدفع
- ✅ إكمال عملية الشراء بدون إنشاء حساب

## استراتيجية التنفيذ

### 1. **Cart للضيوف - LocalStorage**
استخدام `localStorage` لحفظ سلة الضيوف في المتصفح:

```typescript
// client/src/lib/guestCart.ts
interface GuestCartItem {
  productId: string;
  quantity: number;
}

export const guestCart = {
  getItems: (): GuestCartItem[] => {
    const items = localStorage.getItem('guestCart');
    return items ? JSON.parse(items) : [];
  },
  
  addItem: (productId: string, quantity: number = 1) => {
    const items = guestCart.getItems();
    const existingIndex = items.findIndex(i => i.productId === productId);
    
    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ productId, quantity });
    }
    
    localStorage.setItem('guestCart', JSON.stringify(items));
  },
  
  removeItem: (productId: string) => {
    const items = guestCart.getItems().filter(i => i.productId !== productId);
    localStorage.setItem('guestCart', JSON.stringify(items));
  },
  
  updateQuantity: (productId: string, quantity: number) => {
    const items = guestCart.getItems();
    const item = items.find(i => i.productId === productId);
    if (item) {
      item.quantity = quantity;
      localStorage.setItem('guestCart', JSON.stringify(items));
    }
  },
  
  clear: () => {
    localStorage.removeItem('guestCart');
  }
};
```

### 2. **تعديل Cart Component**
التحقق من حالة تسجيل الدخول واستخدام Cart المناسب:

```typescript
// في Cart.tsx
const { data: customer } = trpc.customer.me.useQuery();
const isLoggedIn = !!customer;

// إذا كان مسجل دخول، استخدم السلة من قاعدة البيانات
const { data: serverCart = [] } = trpc.cart.list.useQuery(undefined, {
  enabled: isLoggedIn
});

// إذا لم يكن مسجل، استخدم السلة من localStorage
const [localCart, setLocalCart] = useState<GuestCartItem[]>([]);

useEffect(() => {
  if (!isLoggedIn) {
    setLocalCart(guestCart.getItems());
  }
}, [isLoggedIn]);

const cartItems = isLoggedIn ? serverCart : localCart;
```

### 3. **دمج Carts عند تسجيل الدخول**
عندما يسجل الضيف دخوله، دمج سلته المحلية مع سلته في قاعدة البيانات:

```typescript
// بعد تسجيل الدخول الناجح:
const mergeGuestCart = async () => {
  const guestItems = guestCart.getItems();
  
  for (const item of guestItems) {
    await addToCart.mutateAsync({
      productId: item.productId,
      quantity: item.quantity
    });
  }
  
  guestCart.clear(); // مسح السلة المحلية
};
```

### 4. **تعديل Checkout Page**
السماح بالوصول لصفحة Checkout بدون تسجيل دخول:

```typescript
// في Checkout.tsx - إزالة أي تحقق من تسجيل الدخول

// للعميل المسجل: تحميل البيانات من customer object
// للضيف: عرض النموذج الكامل لإدخال البيانات
```

### 5. **تعديل orders.create endpoint**
التأكد من أن `orders.create` يعمل للضيوف:

```typescript
// في server/routers.ts
create: publicProcedure // ✅ بالفعل publicProcedure
  .input(...)
  .mutation(async ({ input, ctx }) => {
    // ctx.user?.id قد يكون null للضيوف
    const userId = ctx.user?.id || undefined;
    
    // إنشاء الطلب مع أو بدون userId
    const order = await db.createOrder({
      ...input,
      userId, // undefined للضيوف
      // ... باقي البيانات
    });
  })
```

## الخطوات العملية

### المرحلة 1: إعداد البنية التحتية
1. ✅ إنشاء `client/src/lib/guestCart.ts`
2. ✅ إضافة types للـ Guest Cart
3. ✅ اختبار localStorage functions

### المرحلة 2: تعديل UI Components
1. ✅ تعديل `Cart.tsx` لدعم Guest Cart
2. ✅ تعديل `ProductCard.tsx` لإضافة منتجات لـ Guest Cart
3. ✅ تعديل `Checkout.tsx` لإزالة متطلبات تسجيل الدخول

### المرحلة 3: دمج Carts
1. ✅ إضافة logic لدمج Guest Cart عند تسجيل الدخول
2. ✅ اختبار عملية الدمج

### المرحلة 4: اختبار شامل
1. ✅ اختبار إضافة منتجات كضيف
2. ✅ اختبار الدفع كضيف
3. ✅ اختبار تسجيل الدخول ودمج السلة
4. ✅ اختبار إنشاء طلب كضيف

## البدائل

### البديل 1: Session-based Cart
استخدام session في الـ backend بدلاً من localStorage:
- ✅ أكثر أماناً
- ❌ يتطلب إعداد session management
- ❌ أكثر تعقيداً

### البديل 2: Cookie-based Cart
حفظ Cart في cookies:
- ✅ متاح في الـ backend والـ frontend
- ❌ محدود بحجم الـ cookies (4KB)
- ✅ يعمل عبر التبويبات

### البديل 3 (الموصى به): Hybrid Approach
- للضيوف: localStorage
- عند إضافة أول منتج: إنشاء session مؤقت
- عند تسجيل الدخول: دمج مع الحساب

## الاعتبارات الأمنية
- ✅ التحقق من صحة productId في الـ backend
- ✅ التحقق من توفر المنتج قبل إنشاء الطلب
- ✅ التحقق من الأسعار في الـ backend (عدم الثقة بالـ frontend)
- ✅ منع إنشاء طلبات وهمية

## الخلاصة
الحل الأبسط والأسرع للتنفيذ هو:
1. استخدام **localStorage** لسلة الضيوف
2. **صفحة Checkout تعمل للجميع** (مسجلين وضيوف)
3. **دمج السلة** عند تسجيل الدخول
4. **orders.create endpoint** يدعم الضيوف بالفعل (publicProcedure)

هل تريد تنفيذ هذا الحل؟
