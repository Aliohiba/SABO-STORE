/**
 * سكريبت لإضافة إعدادات البريد الإلكتروني لملف .env
 * 
 * استخدام:
 * node add_email_env.cjs
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log('=== إعداد إعدادات البريد الإلكتروني ===\n');

    console.log('البريد المستخدم: sabo@sabo-store.ly\n');

    const smtpHost = await question('1. SMTP Host (مثال: mail.sabo-store.ly): ');
    const smtpPort = await question('2. SMTP Port (مثال: 587 أو 465): ');
    const smtpPass = await question('3. كلمة مرور البريد: ');
    const appUrl = await question('4. رابط الموقع (مثال: https://sabo-store.ly): ');

    const emailConfig = `
# Email Configuration
SMTP_HOST=${smtpHost}
SMTP_PORT=${smtpPort}
SMTP_USER=sabo@sabo-store.ly
SMTP_PASS=${smtpPass}
SMTP_FROM="متجر سابو" <sabo@sabo-store.ly>
APP_URL=${appUrl || 'http://localhost:5000'}
`;

    const envPath = path.join(process.cwd(), '.env');

    // قراءة .env الحالي
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');

        // حذف الإعدادات القديمة إذا وجدت
        envContent = envContent.replace(/# Email Configuration[\s\S]*?(?=\n#|\n[A-Z]|$)/g, '');
    }

    // إضافة الإعدادات الجديدة
    envContent = envContent.trim() + '\n' + emailConfig;

    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ تم حفظ إعدادات البريد الإلكتروني في .env');
    console.log('\n📧 إعدادات البريد:');
    console.log(`   Host: ${smtpHost}`);
    console.log(`   Port: ${smtpPort}`);
    console.log(`   From: sabo@sabo-store.ly`);
    console.log(`   App URL: ${appUrl || 'http://localhost:5000'}`);

    rl.close();
}

main().catch(console.error);
