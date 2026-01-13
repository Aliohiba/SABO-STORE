import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// SMTP Configuration
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'ox.libyanspider.io',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'sabo@sabo-store.ly',
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"متجر سابو" <sabo@sabo-store.ly>',
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

/**
 * Generate verification email HTML
 */
export function generateVerificationEmail(code: string, name?: string): string {
  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header img { max-width: 120px; height: auto; margin-bottom: 15px; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; text-align: center; }
    .code-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; }
    .code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: monospace; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛍️ متجر سابو</h1>
    </div>
    <div class="content">
      <h2>مرحباً ${name || ''}!</h2>
      <p>شكراً لتسجيلك في متجر سابو. استخدم الرمز التالي للتحقق من بريدك الإلكتروني:</p>
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
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
}

/**
 * Generate order confirmation email
 */
export function generateOrderConfirmationEmail(
  orderNumber: string,
  trackingKey: string,
  customerName: string,
  totalAmount: number,
  items: Array<{ name: string; quantity: number; price: number }>
): string {
  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  const trackingUrl = `${appUrl}/track/${trackingKey}`;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${item.price} د.ل</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header img { max-width: 120px; height: auto; margin-bottom: 15px; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .order-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .btn:hover { background: #5568d3; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ تم استلام طلبك</h1>
    </div>
    <div class="content">
      <h2>مرحباً ${customerName}!</h2>
      <p>شكراً لك على طلبك من متجر سابو. تم استلام طلبك بنجاح وسيتم معالجته قريباً.</p>
      
      <div class="order-info">
        <p><strong>رقم الطلب:</strong> #${orderNumber}</p>
        <p><strong>رمز التتبع:</strong> ${trackingKey}</p>
        <p><strong>المبلغ الإجمالي:</strong> ${totalAmount.toFixed(2)} د.ل</p>
      </div>

      <h3>📦 المنتجات:</h3>
      <table>
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 10px; text-align: right;">المنتج</th>
            <th style="padding: 10px; text-align: center;">الكمية</th>
            <th style="padding: 10px; text-align: left;">السعر</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: center;">
        <a href="${trackingUrl}" class="btn">📍 تتبع طلبك</a>
      </div>

      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن والتوصيل.
      </p>
    </div>
    <div class="footer">
      <p>متجر سابو © 2026 | sabo-store.ly</p>
      <p style="font-size: 12px;">للاستفسارات: sabo@sabo-store.ly</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate order status update email
 */
export function generateOrderStatusEmail(
  orderNumber: string,
  trackingKey: string,
  customerName: string,
  newStatus: string,
  statusArabic: string
): string {
  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  const trackingUrl = `${appUrl}/track/${trackingKey}`;

  const statusEmoji: Record<string, string> = {
    pending: '⏳',
    confirmed: '✅',
    shipped: '🚚',
    delivered: '🎉',
    cancelled: '❌',
  };

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header img { max-width: 120px; height: auto; margin-bottom: 15px; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; text-align: center; }
    .status-box { background: #f8f9fa; border-radius: 12px; padding: 30px; margin: 30px 0; }
    .status-emoji { font-size: 60px; margin-bottom: 15px; }
    .status-text { font-size: 24px; font-weight: bold; color: #667eea; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .btn:hover { background: #5568d3; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 تحديث حالة طلبك</h1>
    </div>
    <div class="content">
      <h2>مرحباً ${customerName}!</h2>
      <p>تم تحديث حالة طلبك رقم <strong>#${orderNumber}</strong></p>
      
      <div class="status-box">
        <div class="status-emoji">${statusEmoji[newStatus] || '📦'}</div>
        <div class="status-text">${statusArabic}</div>
      </div>

      <a href="${trackingUrl}" class="btn">🔍 تتبع طلبك الآن</a>

      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        رمز التتبع: <strong>${trackingKey}</strong>
      </p>
    </div>
    <div class="footer">
      <p>متجر سابو © 2026 | sabo-store.ly</p>
      <p style="font-size: 12px;">للاستفسارات: sabo@sabo-store.ly</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Test email connection
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
}
