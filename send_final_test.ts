import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateVerificationEmail } from './server/services/email';

dotenv.config();

async function sendFinalTest() {
    const transporter = nodemailer.createTransport({
        host: 'ox.libyanspider.io',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        console.log('🔄 إرسال رسالة تجريبية نهائية...\n');

        const info = await transporter.sendMail({
            from: '"متجر سابو" <sabo@sabo-store.ly>',
            to: 'aliohiba7@gmail.com',
            subject: '🔐 رمز التحقق - متجر سابو (التصميم النهائي)',
            html: generateVerificationEmail('824567', 'علي'),
        });

        console.log('✅ تم إرسال البريد النهائي بنجاح!');
        console.log('📧 إلى: aliohiba7@gmail.com');
        console.log('Message ID:', info.messageId);
        console.log('\n🎨 يُرجى فحص البريد لترى:');
        console.log('  - شعار المتجر في الأعلى');
        console.log('  - زر نسخ الرمز');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    }
}

sendFinalTest();
