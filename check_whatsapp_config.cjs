// Quick check to verify WhatsApp environment variables are loaded
require('dotenv').config();

console.log('\n🔍 Checking WhatsApp Configuration...\n');

const checks = {
    'WHATSAPP_API_KEY': process.env.WHATSAPP_API_KEY,
    'WHATSAPP_ACCOUNT_ID': process.env.WHATSAPP_ACCOUNT_ID,
    'WHATSAPP_ACCOUNT_LICENCE': process.env.WHATSAPP_ACCOUNT_LICENCE,
    'WHATSAPP_BASE_URL': process.env.WHATSAPP_BASE_URL || 'https://api.smsmobileapi.com (default)',
};

let allConfigured = true;

for (const [key, value] of Object.entries(checks)) {
    if (value && !value.includes('default')) {
        console.log(`✅ ${key}: ${value.substring(0, 10)}...`);
    } else if (value && value.includes('default')) {
        console.log(`✅ ${key}: ${value}`);
    } else {
        console.log(`❌ ${key}: NOT SET`);
        allConfigured = false;
    }
}

console.log('');

if (allConfigured) {
    console.log('🎉 All WhatsApp configuration variables are set!');
    console.log('✅ WhatsApp OTP service is ready to use.');
    console.log('');
    console.log('📱 Try it now:');
    console.log('   1. Go to Forgot Password page');
    console.log('   2. Enter a registered phone number');
    console.log('   3. Click "Send Code"');
    console.log('   4. Check WhatsApp for the OTP message');
} else {
    console.log('⚠️  Some WhatsApp configuration variables are missing!');
    console.log('💡 Run: node add_whatsapp_env.cjs');
}

console.log('');
