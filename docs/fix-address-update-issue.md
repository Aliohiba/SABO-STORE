# إصلاح مشكلة عدم حفظ التعديلات على العنوان في صفحة الدفع - Darb Sabil

## المشكلة الأصلية
عندما يقوم العميل المسجل بتعديل عنوانه (المدينة، المنطقة، أو العنوان التفصيلي) في صفحة إتمام الطلب ثم يضغط على "حفظ التغييرات"، كانت البيانات **لا تُحفظ في قاعدة البيانات**.

### السلوك الخاطئ السابق:
1. العميل يضغط "تعديل" على العنوان
2. يقوم بتغيير المدينة أو المنطقة
3. يضغط "حفظ التغييرات"
4. النموذج يُغلق ولكن **البيانات تبقى في الذاكرة المؤقتة فقط** (`formData` في React State)
5. عند إنشاء طلب جديد، النظام قد يقرأ البيانات القديمة من `customer` object بدلاً من البيانات المحدثة
6. ❌ **النتيجة**: Darb Sabil يستقبل العنوان القديم وليس الجديد

## الحل المطبق

### 1. إضافة Endpoint لتحديث بيانات العميل
تم إضافة `updateProfile` mutation في `server/routers/customer.ts`:

```typescript
updateProfile: publicProcedure
    .input(
        z.object({
            name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").optional(),
            email: z.string().email("البريد الإلكتروني غير صحيح").optional(),
            cityId: z.union([z.string(), z.number()]).optional(),
            area: z.string().optional(),
            address: z.string().optional(),
            alternativePhone: z.string().optional(),
        })
    )
    .mutation(async ({ input, ctx }) => {
        // التحقق من صلاحيات العميل
        // تحديث البيانات في MongoDB
        // إرجاع البيانات المحدثة
    })
```

**الميزات:**
- ✅ يتحقق من أن المستخدم مسجل دخول
- ✅ يتحقق من أن البريد الإلكتروني غير مكرر
- ✅ يحدث جميع الحقول المطلوبة (اسم، بريد، مدينة، منطقة، عنوان)
- ✅ يرجع البيانات المحدثة بعد الحفظ

### 2. ربط زر "حفظ التغييرات" بالـ Mutation
في `client/src/pages/Checkout.tsx`:

**قبل:**
```tsx
onClick={() => setShowAddressForm(false)}
```

**بعد:**
```tsx
onClick={async () => {
  try {
    await updateProfile.mutateAsync({
      name: formData.customerName,
      email: formData.customerEmail || undefined,
      cityId: formData.cityId || undefined,
      area: formData.area || undefined,
      address: formData.customerAddress || undefined,
    });
    toast.success('تم حفظ التغييرات بنجاح');
    await refetchCustomer();
    setShowAddressForm(false);
  } catch (error) {
    toast.error('فشل حفظ التغييرات');
  }
}}
```

**الميزات:**
- ✅ يحفظ البيانات في قاعدة البيانات
- ✅ يعرض رسالة نجاح/فشل للمستخدم
- ✅ يحدّث بيانات العميل المعروضة (`refetchCustomer`)
- ✅ يدعم حالة التحميل (زر معطل أثناء الحفظ)

### 3. إصلاح قراءة البيانات عند إنشاء الطلب
تم تعديل السطر 198 لقراءة `area` من `formData` بدلاً من `customer?.area`:

**قبل:**
```tsx
area: customer?.area || undefined
```

**بعد:**
```tsx
area: deliveryMethod === 'pickup' ? undefined : (formData.area || undefined)
```

### 4. إصلاح زر "إلغاء" 
تم إضافة `area` إلى البيانات التي تُعاد عند الضغط على "إلغاء":

```tsx
setFormData({
  customerName: customer.name || "",
  customerEmail: customer.email || "",
  customerPhone: customer.phone || "",
  customerAddress: customer.address || "",
  notes: formData.notes,
  cityId: customer.cityId || 0,
  area: customer.area || "", // ✅ تمت الإضافة
});
```

## التدفق الكامل للبيانات

### حالة 1: عميل مسجل يعدل عنوانه
```
1. صفحة الدفع تحمّل بيانات العميل من قاعدة البيانات
   customer.me.useQuery() → formData
   
2. العميل يضغط "تعديل"
   setShowAddressForm(true)
   
3. العميل يغير المدينة أو المنطقة
   formData.cityId = newCityId
   formData.area = newArea
   
4. العميل يضغط "حفظ التغييرات"
   updateProfile.mutateAsync({ cityId, area, ... })
   ↓
   Backend: Customer.findByIdAndUpdate()
   ↓
   MongoDB: تحديث بيانات العميل
   ↓
   toast.success('تم حفظ التغييرات بنجاح')
   ↓
   refetchCustomer() - تحديث البيانات المعروضة
   
5. العميل يضغط "تأكيد الطلب"
   createOrder.mutate({ area: formData.area, ... })
   ↓
   Backend: db.createOrder({ area: fullOrder.area })
   ↓
   MongoDB: حفظ الطلب مع العنوان الجديد
   
6. Admin يغير حالة الطلب إلى "confirmed"
   DarbSabilService.createOrder({
     cityId: fullOrder.cityId,  // ✅ المدينة الجديدة
     area: fullOrder.area,      // ✅ المنطقة الجديدة
     address: fullOrder.address // ✅ العنوان الجديد
   })
```

### حالة 2: عميل غير مسجل
```
1. العميل يدخل بياناته في النموذج
   formData = { customerName, cityId, area, ... }
   
2. العميل يضغط "تأكيد الطلب"
   createOrder.mutate({ area: formData.area, ... })
   ↓
   Backend: حفظ الطلب مع البيانات المدخلة
   
3. عند التأكيد → Darb Sabil يستقبل البيانات الصحيحة
```

## الملفات المعدلة

### Backend
1. **`server/routers/customer.ts`**
   - ✅ إضافة `updateProfile` endpoint (السطر 167-245)

### Frontend  
2. **`client/src/pages/Checkout.tsx`**
   - ✅ إضافة `updateProfile` mutation (السطر 45)
   - ✅ إضافة `refetchCustomer` (السطر 44)
   - ✅ تحديث زر "حفظ التغييرات" (السطر 566-589)
   - ✅ إصلاح قراءة `area` عند إنشاء الطلب (السطر 200)
   - ✅ إصلاح زر "إلغاء" لإعادة `area` (السطر 585)

## الفوائد

### ✅ للعملاء المسجلين:
- تحديث دائم للعنوان في حسابهم
- عدم الحاجة لإعادة إدخال العنوان في كل طلب
- البيانات محفوظة بشكل آمن في قاعدة البيانات

### ✅ للعملاء غير المسجلين:
- إدخال العنوان مرة واحدة في صفحة الدفع
- البيانات تُحفظ مع الطلب فقط

### ✅ لـ Darb Sabil:
- استلام البيانات الصحيحة والمحدثة دائماً
- تقليل الأخطاء في التوصيل
- تحسين تجربة العميل

## الاختبار

### اختبار عميل مسجل:
1. ✅ تسجيل الدخول كعميل
2. ✅ الذهاب إلى صفحة الدفع
3. ✅ الضغط على "تعديل" العنوان
4. ✅ تغيير المدينة والمنطقة
5. ✅ الضغط على "حفظ التغييرات"
6. ✅ التحقق من ظهور رسالة "تم حفظ التغييرات بنجاح"
7. ✅ إنشاء طلب
8. ✅ من لوحة Admin، تغيير حالة الطلب إلى "confirmed"
9. ✅ التحقق من logs أن Darb Sabil استلم العنوان الجديد

### اختبار عميل غير مسجل:
1. ✅ الذهاب إلى صفحة الدفع بدون تسجيل دخول
2. ✅ إدخال جميع البيانات
3. ✅ إنشاء طلب
4. ✅ من لوحة Admin، تغيير حالة الطلب إلى "confirmed"
5. ✅ التحقق من logs أن Darb Sabil استلم البيانات الصحيحة

## الملاحظات الفنية

### أمان
- ✅ التحقق من صلاحيات العميل قبل التحديث
- ✅ منع تكرار البريد الإلكتروني
- ✅ استخدام `publicProcedure` مع فحص `ctx.user`

### UX
- ✅ رسائل واضحة للمستخدم (نجاح/فشل)
- ✅ حالة تحميل في زر الحفظ
- ✅ تحديث البيانات المعروضة فوراً

### أداء
- ✅ تحديث انتقائي للحقول المطلوبة فقط
- ✅ استخدام `refetch` فقط عند الحاجة
- ✅ معالجة الأخطاء بشكل صحيح

## التاريخ
- **2026-01-04 (19:00)**: إصلاح مشكلة عدم حفظ تعديلات العنوان في قاعدة البيانات
