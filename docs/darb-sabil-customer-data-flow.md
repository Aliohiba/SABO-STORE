# توثيق نظام قراءة بيانات العملاء لشركة درب السبيل

## المشكلة السابقة
كان النظام يقرأ بيانات `area` من حساب العميل المسجل فقط (`customer?.area`)، وهذا يعني:
- ❌ عندما يقوم العميل المسجل بتحديث عنوانه، لا يتم إرسال العنوان الجديد
- ❌ عندما يكون العميل غير مسجل (guest checkout)، لا يتم إرسال المنطقة

## الحل المطبق
تم تعديل ملف `client/src/pages/Checkout.tsx` في السطر 198 لقراءة بيانات العنوان من `formData` بدلاً من `customer?.area`.

### قبل التعديل:
```tsx
area: customer?.area || undefined
```

### بعد التعديل:
```tsx
area: deliveryMethod === 'pickup' ? undefined : (formData.area || undefined)
```

## كيفية عمل النظام الآن

### 1. **عميل مسجل مسبقاً**
- عند تحميل صفحة الدفع، يتم ملء `formData` ببيانات العميل من قاعدة البيانات (السطر 97-109)
- البيانات تشمل: `customerName`, `customerEmail`, `customerPhone`, `customerAddress`, `cityId`, `area`
- عند إرسال الطلب، يتم قراءة جميع البيانات من `formData`
- ✅ يتم قراءة بيانات العميل المحفوظة

### 2. **عميل مسجل قام بتحديث عنوانه**
- عند النقر على زر "تعديل"، يظهر نموذج التعديل (السطر 401)
- عند تحديث المدينة أو المنطقة، يتم تحديث `formData` فوراً
- عند إرسال الطلب، يتم قراءة البيانات المحدثة من `formData`
- ✅ يتم قراءة بيانات العنوان المحدثة

### 3. **عميل غير مسجل (Guest)**
- يظهر النموذج الكامل لإدخال جميع البيانات (السطر 451-594)
- عند إدخال المدينة والمنطقة، يتم حفظها في `formData`
- عند إرسال الطلب، يتم قراءة البيانات المدخلة من `formData`
- ✅ يتم قراءة بيانات العنوان المدخلة

## تدفق البيانات الكامل

### Frontend (Checkout.tsx)
```
1. جمع البيانات من formData
   ↓
2. إرسال الطلب عبر createOrder.mutate
   ↓
3. البيانات المرسلة:
   - customerName
   - customerPhone
   - customerEmail
   - customerAddress
   - cityId
   - area ← تم إصلاحها لتقرأ من formData
   - deliveryCompanyId (darb أو vanex)
```

### Backend (routers.ts - orders.create)
```
1. استقبال البيانات (السطر 348-423)
   ↓
2. حفظ الطلب في قاعدة البيانات
   db.createOrder({ ...input })
   ↓
3. حفظ جميع الحقول بما فيها:
   - cityId
   - area
   - deliveryCompanyId
```

### Backend (routers.ts - orders.updateStatus)
```
عند تغيير حالة الطلب إلى "confirmed":

1. قراءة بيانات الطلب من قاعدة البيانات (السطر 478)
   ↓
2. إذا كانت الشركة "darb" (السطر 514):
   ↓
3. تجهيز البيانات لـ Darb Sabil (السطر 519-529):
   const darbData = {
     orderNumber: fullOrder.orderNumber,
     customerName: fullOrder.customerName,      ← من قاعدة البيانات
     customerPhone: fullOrder.customerPhone,    ← من قاعدة البيانات
     customerEmail: fullOrder.customerEmail,    ← من قاعدة البيانات
     address: fullOrder.customerAddress,        ← من قاعدة البيانات
     cityId: fullOrder.cityId,                  ← من قاعدة البيانات
     area: fullOrder.area,                      ← من قاعدة البيانات ✅
     amount: fullOrder.totalAmount,
     comment: fullOrder.notes
   }
   ↓
4. إرسال الطلب إلى Darb Sabil API (السطر 532)
   DarbSabilService.createOrder(darbData)
```

### DarbSabil Service (darb_sabil.ts)
```
1. استقبال orderData (السطر 222)
   ↓
2. إنشاء جهة اتصال Contact (السطر 223-248)
   ↓
3. تحويل cityId إلى اسم المدينة إذا لزم الأمر (السطر 253)
   ↓
4. التحقق من صحة المنطقة (area) والمدينة (السطر 254-273)
   - إذا كانت المنطقة غير صحيحة للمدينة المحددة، يتم تصحيحها تلقائياً
   ↓
5. إنشاء الشحنة Shipment (السطر 275-303)
   shipmentPayload = {
     to: {
       city: cityName,      ← من orderData.cityId
       area: areaName,      ← من orderData.area (مع التحقق)
       address: orderData.address
     }
   }
```

## ملخص التحسينات
✅ يتم قراءة بيانات العنوان الحالية (المحدثة) من `formData` بدلاً من البيانات القديمة  
✅ يدعم العملاء المسجلين  
✅ يدعم تحديث العنوان للعملاء المسجلين  
✅ يدعم العملاء غير المسجلين (Guest Checkout)  
✅ جميع البيانات يتم حفظها بشكل صحيح في قاعدة البيانات  
✅ جميع البيانات يتم قراءتها بشكل صحيح عند إرسال الطلب إلى Darb Sabil  

## الملفات المعدلة
- ✏️ `client/src/pages/Checkout.tsx` (السطر 198)

## التاريخ
- 2026-01-04: إصلاح قراءة بيانات area من formData بدلاً من customer?.area
