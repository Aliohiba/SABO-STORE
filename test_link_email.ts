import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateOrderConfirmationEmail } from './server/services/email';

dotenv.config();

async function sendLinkTest() {
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
        console.log('🔄 إرسال رسالة لاختبار الرابط...\n');
        console.log('APP_URL current value:', process.env.APP_URL);

        const info = await transporter.sendMail({
            from: '"متجر سابو" <sabo@sabo-store.ly>',
            to: 'aliohiba7@gmail.com',
            subject: '📦 اختبار رابط التتبع (Localhost)',
            html: generateOrderConfirmationEmail(
                'ORDER-123',
                'TRK-TEST-KEY',
                'علي',
                150.00,
                [{ name: 'منتج تجريبي', quantity: 1, price: 150 }]
            ),
        });

        console.log('✅ تم إرسال البريد!');
        console.log('🔗 الرابط المتوقع: http://localhost:5000/track/TRK-TEST-KEY');

    } catch (error) {
        console.error('❌ خطأ:', error);
    }
}

sendLinkTest();
