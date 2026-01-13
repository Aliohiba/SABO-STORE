# خطة تنفيذ نظام البريد الإلكتروني

## نظرة عامة

تنفيذ نظام إشعارات بريد إلكتروني شامل يتضمن:
1. **التحقق من البريد** عند التسجيل
2. **إشعارات الطلبات** (تأكيد + رابط التتبع)
3. **تحديثات حالة الطلب**

## متطلبات التنفيذ

### 1. إعداد SMTP

**الحلول الموصى بها:**
- ✅ **Gmail SMTP** (مجاني حتى 500 بريد/يوم)
- ✅ **Mailgun** (مجاني حتى 5000 بريد/شهر)
- ✅ **SendGrid** (مجاني حتى 100 بريد/يوم)

**متغيرات البيئة المطلوبة:**
```env
# .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="المتجر" <noreply@example.com>
APP_URL=http://localhost:5000
```

## User Review Required

> [!IMPORTANT]
> **اختيار خدمة البريد الإلكتروني**
> 
> يُرجى اختيار إحدى الخدمات:
> 1. **Gmail** - سهل الإعداد، مناسب للاختبار والمواقع الصغيرة
> 2. **Mailgun** - احترافي، تقارير مفصلة
> 3. **SendGrid** - الأكثر شهرة، سهل التكامل
> 
> سأحتاج منك بيانات SMTP بعد الاختيار.

> [!WARNING]
> **حماية البريد الإلكتروني**
> 
> - لا تستخدم كلمة مرور حسابك الرئيسي
> - استخدم "App Password" لـ Gmail
> - احتفظ ببيانات SMTP في `.env` فقط

## الملفات المطلوب إنشاؤها

### 1. خدمة البريد الإلكتروني

#### `server/services/email.ts`
```typescript
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Implementation
}

export function generateVerificationEmail(code: string): string {
  // HTML template
}

export function generateOrderConfirmationEmail(
  orderNumber: string,
  trackingKey: string,
  customerName: string,
  totalAmount: number
): string {
  // HTML template
}

export function generateOrderStatusEmail(
  orderNumber: string,
  trackingKey: string,
  newStatus: string
): string {
  // HTML template
}
```

### 2. تحديث Schema

#### `server/schemas.ts`
```typescript
// إضافة حقول للتحقق
interface IUser {
  // ... existing fields
  emailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
}
```

### 3. تحديث Routers

#### إضافة في `server/routers.ts`
```typescript
// Email verification
sendVerificationEmail: publicProcedure
  .input(z.object({ email: z.string().email() }))
  .mutation(async ({ input }) => { /* ... */ }),

verifyEmail: publicProcedure
  .input(z.object({ email: z.string(), code: z.string() }))
  .mutation(async ({ input }) => { /* ... */ }),
```

### 4. تحديث Register.tsx

إضافة خطوة تحقق من البريد بعد التسجيل:
- عرض نموذج إدخال رمز التحقق
- إرسال الرمز للتحقق
- تفعيل الحساب

## خطة التنفيذ

### المرحلة 1: إعداد البنية التحتية

1. **تثبيت nodemailer**
   ```bash
   npm install nodemailer
   npm install -D @types/nodemailer
   ```

2. **إنشاء `server/services/email.ts`**
   - Transporter configuration
   - sendEmail function
   - Email templates

3. **تحديث `.env`** مع بيانات SMTP

### المرحلة 2: التحقق من البريد

1. **تحديث User Schema**
   - إضافة `emailVerified`, `verificationCode`, `verificationCodeExpiry`

2. **إضافة Endpoints**
   - `auth.sendVerificationEmail`
   - `auth.verifyEmail`

3. **تحديث Register.tsx**
   - نموذج التحقق
   - إرسال/التحقق من الرمز

### المرحلة 3: إشعارات الطلبات

1. **عند إنشاء الطلب** (`orders.create`)
   - إرسال بريد تأكيد
   - تضمين `trackingKey` ورابط `/track/:key`

2. **عند تحديث الحالة** (`orders.update`)
   - التحقق من تغيير الحالة
   - إرسال إشعار للعميل

## قوالب البريد الموصى بها

### تصميم موحد
- شعار المتجر في الأعلى
- ألوان متناسقة مع الموقع
- زر CTA واضح
- تذييل بمعلومات الاتصال

### محتوى البريد

**1. التحقق:**
```
مرحباً،
رمز التحقق الخاص بك: 123456
(صالح لمدة 15 دقيقة)
```

**2. تأكيد الطلب:**
```
شكراً لطلبك! (#12345)
رابط التتبع: [تتبع طلبك]
المبلغ الإجمالي: 250 د.ل
```

**3. تحديث الحالة:**
```
تم تحديث طلبك (#12345)
الحالة الجديدة: قيد التوصيل
[تتبع طلبك]
```

## الاختبار

### اختبار محلي
1. استخدام Gmail مع App Password
2. إرسال بريد تجريبي للتحقق من الاتصال
3. اختبار كل قالب

### نقاط الفحص
- ✅ استلام البريد في صندوق الوارد (ليس Spam)
- ✅ التنسيق صحيح على الجوال والحاسوب
- ✅ الروابط تعمل بشكل صحيح
- ✅ اللغة العربية تظهر بشكل صحيح

## الملفات المتأثرة

### جديدة
- `server/services/email.ts` - خدمة البريد

### معدلة
- `server/schemas.ts` - إضافة حقول التحقق
- `server/routers.ts` - endpoints التحقق والإشعارات
- `client/src/pages/Register.tsx` - نموذج التحقق
- `package.json` - إضافة nodemailer

## ملاحظات الأمان

1. **Rate Limiting**: حد أقصى 3 رسائل/ساعة لنفس Email
2. **Code Expiry**: رموز التحقق تنتهي بعد 15 دقيقة
3. **No Sensitive Data**: لا ترسل كلمات مرور في البريد
4. **SSL/TLS**: استخدام اتصال آمن
