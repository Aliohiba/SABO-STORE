import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateVerificationEmail } from './server/services/email';

dotenv.config();

async function sendFixedTest() {
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
        console.log('🔄 إرسال رسالة تجريبية بعد الإصلاح...\n');

        const info = await transporter.sendMail({
            from: '"متجر سابو" <sabo@sabo-store.ly>',
            to: 'aliohiba7@gmail.com',
            subject: '🔐 رمز التحقق - متجر سابو (بعد الإصلاح)',
            html: generateVerificationEmail('824567', 'علي'),
        });

        console.log('✅ تم إرسال البريد بنجاح!');
        console.log('Message ID:', info.messageId);
        console.log('\n✅ التحسينات:');
        console.log('  - استبدال الشعار بإيموجي (يعمل في كل مكان)');
        console.log('  - إزالة زر النسخ (غير مدعوم في البريد)');
        console.log('  - إضافة نصيحة للنسخ اليدوي');
        console.log('\n📧 يُرجى فحص البريد الجديد!');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    }
}

sendFixedTest();
