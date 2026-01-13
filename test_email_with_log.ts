import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function testEmail() {
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync('email_test_log.txt', msg + '\n');
    };

    fs.writeFileSync('email_test_log.txt', '=== اختبار SMTP ===\n');

    log('Host: ox.libyanspider.io');
    log('Port: 587');
    log('User: ' + process.env.SMTP_USER);
    log('');

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
        log('⏳ اختبار الاتصال...');
        await transporter.verify();
        log('✅ الاتصال ناجح!');
        log('');

        log('⏳ إرسال بريد تجريبي...');
        const info = await transporter.sendMail({
            from: '"متجر سابو" <sabo@sabo-store.ly>',
            to: 'aliohiba7@gmail.com',
            subject: 'رمز التحقق - متجر سابو',
            html: '<h1>مرحباً!</h1><p>رسالة تجريبية من متجر سابو</p>',
        });

        log('✅✅✅ تم إرسال البريد بنجاح! ✅✅✅');
        log('Message ID: ' + info.messageId);
        log('');
        log('يُرجى فحص aliohiba7@gmail.com');

    } catch (error) {
        log('❌ خطأ: ' + error.message);
        log('Stack: ' + error.stack);
    }
}

testEmail();
