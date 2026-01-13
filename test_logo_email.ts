import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateVerificationEmail } from './server/services/email';

dotenv.config();

async function sendLogoTest() {
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
        console.log('🔄 إرسال رسالة مع الشعار...\n');

        const info = await transporter.sendMail({
            from: '"متجر سابو" <sabo@sabo-store.ly>',
            to: 'aliohiba7@gmail.com',
            subject: '🔐 رمز التحقق - متجر سابو (مع الشعار)',
            html: generateVerificationEmail('824567', 'علي'),
        });

        console.log('✅ تم إرسال البريد بنجاح!');
        console.log('Message ID:', info.messageId);
        console.log('\n📧 يُرجى فحص البريد - يجب أن يظهر:');
        console.log('  ✅ شعار المتجر في الأعلى');
        console.log('  ✅ بدون رسالة النصيحة');

    } catch (error) {
        console.error('❌ خطأ:', error);
    }
}

sendLogoTest();
