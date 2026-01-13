import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
    console.log('🔄 اختبار: ox.libyanspider.io\n');

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
        await transporter.verify();
        console.log('✅ الاتصال ناجح!\n');

        const emailHTML = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; text-align: center; }
    .code-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; }
    .code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: monospace; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🛍️ متجر سابو</h1></div>
    <div class="content">
      <h2>مرحباً علي!</h2>
      <p>شكراً لتسجيلك في متجر سابو. استخدم الرمز التالي للتحقق من بريدك الإلكتروني:</p>
      <div class="code-box"><div class="code">824567</div></div>
      <p style="color: #666; font-size: 14px;">الرمز صالح لمدة 15 دقيقة</p>
    </div>
    <div class="footer">
      <p>متجر سابو © 2026 | sabo-store.ly</p>
      <p style="font-size: 12px; color: #999;">إذا لم تطلب هذا الرمز، يُرجى تجاهل هذه الرسالة</p>
    </div>
  </div>
</body>
</html>
    `;

        const info = await transporter.sendMail({
            from: '"متجر سابو" <sabo@sabo-store.ly>',
            to: 'aliohiba7@gmail.com',
            subject: '🔐 رمز التحقق - متجر سابو',
            html: emailHTML,
        });

        console.log('📧 تم إرسال البريد بنجاح!');
        console.log('Message ID:', info.messageId);
        console.log('\n✅ يُرجى فحص صندوق الوارد في aliohiba7@gmail.com');

    } catch (error) {
        console.error('❌ فشل:', error.message);
    }
}

testEmail();
