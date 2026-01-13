/**
 * سكريبت لإرسال رسالة تحقق تجريبية
 */

import dotenv from 'dotenv';
import { sendEmail, generateVerificationEmail } from '../services/email';

dotenv.config();

async function main() {
    console.log('=== إرسال رسالة تحقق تجريبية ===\n');

    const testEmail = 'aliohiba7@gmail.com';
    const verificationCode = '824567'; // رمز تجريبي
    const customerName = 'علي';

    console.log(`إرسال رسالة إلى: ${testEmail}`);
    console.log(`رمز التحقق: ${verificationCode}\n`);

    const success = await sendEmail({
        to: testEmail,
        subject: '🔐 رمز التحقق - متجر سابو',
        html: generateVerificationEmail(verificationCode, customerName),
    });

    if (success) {
        console.log('✅ تم إرسال البريد بنجاح!');
        console.log('\nيُرجى فحص صندوق الوارد في:');
        console.log(`📧 ${testEmail}`);
    } else {
        console.error('❌ فشل إرسال البريد');
        console.log('\nتحقق من:');
        console.log('- إعدادات SMTP في .env');
        console.log('- اتصال الإنترنت');
        console.log('- كلمة المرور صحيحة');
    }
}

main().catch(console.error);
