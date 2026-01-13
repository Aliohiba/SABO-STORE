/**
 * سكريبت لاختبار اتصال البريد الإلكتروني
 *  
 * استخدام:
 * npx tsx server/scripts/test_email.ts
 */

import dotenv from 'dotenv';
import { testEmailConnection, sendEmail, generateVerificationEmail } from '../services/email';

dotenv.config();

async function main() {
    console.log('=== اختبار اتصال البريد الإلكتروني ===\n');

    // Test connection
    console.log('1. اختبار الاتصال بخادم SMTP...');
    const connectionOk = await testEmailConnection();

    if (!connectionOk) {
        console.error('\n❌ فشل الاتصال بخادم SMTP');
        console.log('\nتحقق من:');
        console.log('- SMTP_HOST:', process.env.SMTP_HOST);
        console.log('- SMTP_PORT:', process.env.SMTP_PORT);
        console.log('- SMTP_USER:', process.env.SMTP_USER);
        console.log('- كلمة المرور صحيحة؟');
        process.exit(1);
    }

    console.log('\n2. إرسال بريد تجريبي...');

    const testEmail = process.env.SMTP_USER || 'sabo@sabo-store.ly';
    const testCode = '123456';

    const success = await sendEmail({
        to: testEmail,
        subject: 'اختبار البريد الإلكتروني - متجر سابو',
        html: generateVerificationEmail(testCode, 'مسؤول الاختبار'),
    });

    if (success) {
        console.log(`\n✅ تم إرسال البريد التجريبي إلى: ${testEmail}`);
        console.log('يُرجى التحقق من صندوق الوارد');
    } else {
        console.error('\n❌ فشل إرسال البريد');
    }
}

main().catch(console.error);
