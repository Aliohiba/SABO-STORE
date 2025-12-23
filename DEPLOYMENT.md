# نشر SABO STORE على Render

## المتطلبات
- حساب GitHub
- حساب Render (مجاني)
- MongoDB Atlas (قاعدة بيانات مجانية)

## خطوات النشر

### 1. إنشاء قاعدة بيانات MongoDB على MongoDB Atlas

1. اذهب إلى [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ حساباً مجانياً
3. أنشئ مشروعاً جديداً
4. أنشئ cluster مجاني
5. انسخ رابط الاتصال (Connection String)

### 2. رفع المشروع إلى GitHub

```bash
# إذا لم تكن قد رفعت المشروع بعد
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sabo-store.git
git push -u origin main
```

### 3. نشر على Render

1. اذهب إلى [Render](https://render.com)
2. سجل الدخول باستخدام حسابك على GitHub
3. اضغط على "New +" ثم اختر "Web Service"
4. اختر المستودع `sabo-store`
5. املأ البيانات التالية:
   - **Name:** sabo-store
   - **Environment:** Docker
   - **Plan:** Free (أو Pro إذا كنت تريد أداء أفضل)

6. أضف متغيرات البيئة:
   - `MONGODB_URI`: رابط الاتصال من MongoDB Atlas
   - `NODE_ENV`: production
   - `PORT`: 3000

7. اضغط "Create Web Service"

### 4. انتظر النشر

سيستغرق النشر عادة 5-10 دقائق. ستحصل على رابط مثل:
```
https://sabo-store.onrender.com
```

## ملاحظات مهمة

- الخطة المجانية من Render قد تكون بطيئة في البداية (cold start)
- قاعدة البيانات المجانية من MongoDB Atlas محدودة بـ 512 MB
- للإنتاج الحقيقي، يفضل استخدام خطة مدفوعة

## استكشاف الأخطاء

إذا واجهت مشاكل:

1. تحقق من السجلات على Render dashboard
2. تأكد من أن متغيرات البيئة صحيحة
3. تأكد من أن MongoDB Atlas يسمح بالاتصالات من أي مكان (IP Whitelist)

## الخطوات التالية

بعد النشر الناجح:

1. اختبر الموقع على الرابط المعطى
2. أضف نطاق مخصص (اختياري)
3. فعّل HTTPS (يتم تلقائياً على Render)
4. راقب الأداء والسجلات بانتظام
