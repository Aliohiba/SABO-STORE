// Test script for WhatsApp OTP sending
// Usage: node test_whatsapp_otp.cjs 0912345678

const testPhoneNumber = process.argv[2] || '0912345678';

async function testWhatsAppOTP() {
    console.log('🧪 Testing WhatsApp OTP Service...\n');

    try {
        // Load environment variables
        require('dotenv').config();

        console.log('📋 Configuration Check:');
        console.log('  WHATSAPP_API_KEY:', process.env.WHATSAPP_API_KEY ? '✅ Set' : '❌ Missing');
        console.log('  WHATSAPP_ACCOUNT_ID:', process.env.WHATSAPP_ACCOUNT_ID ? '✅ Set' : '❌ Missing');
        console.log('  WHATSAPP_ACCOUNT_LICENCE:', process.env.WHATSAPP_ACCOUNT_LICENCE ? '✅ Set' : '❌ Missing');
        console.log('  WHATSAPP_BASE_URL:', process.env.WHATSAPP_BASE_URL || 'https://api.smsmobileapi.com');
        console.log('');

        if (!process.env.WHATSAPP_API_KEY || !process.env.WHATSAPP_ACCOUNT_ID || !process.env.WHATSAPP_ACCOUNT_LICENCE) {
            console.log('❌ Missing required environment variables!');
            console.log('💡 Run: node add_whatsapp_env.cjs');
            process.exit(1);
        }

        // Generate test OTP
        const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`📱 Test Phone Number: ${testPhoneNumber}`);
        console.log(`🔐 Test OTP: ${testOTP}`);
        console.log('');

        // Format phone number
        let phone = testPhoneNumber.replace(/\D/g, '');
        if (phone.startsWith('0')) {
            phone = '218' + phone.substring(1);
        }
        if (!phone.startsWith('218')) {
            phone = '218' + phone;
        }

        console.log(`📞 Formatted Phone: ${phone}`);
        console.log('');

        // Prepare message
        const message = `🔐 رمز التحقق الخاص بك هو: ${testOTP}\n\n✅ الرمز صالح لمدة 10 دقائق.\n⚠️ لا تشارك هذا الرمز مع أي شخص.`;

        // Build URL
        const baseUrl = process.env.WHATSAPP_BASE_URL || 'https://api.smsmobileapi.com';
        const url = new URL(`${baseUrl}/sendsms`);
        url.searchParams.append('recipients', phone);
        url.searchParams.append('message', message);
        url.searchParams.append('apikey', process.env.WHATSAPP_API_KEY);
        url.searchParams.append('waonly', 'yes'); // WhatsApp ONLY (not SMS)
        url.searchParams.append('account_id', process.env.WHATSAPP_ACCOUNT_ID);
        url.searchParams.append('account_licence', process.env.WHATSAPP_ACCOUNT_LICENCE);

        console.log('📤 Sending WhatsApp message...');
        console.log(`🔗 URL: ${url.toString().substring(0, 80)}...`);
        console.log('');

        // Send request
        const response = await fetch(url.toString());

        console.log('📥 Response Status:', response.status, response.statusText);

        const responseText = await response.text();
        console.log('📄 Response Body:', responseText);
        console.log('');

        if (response.ok) {
            console.log('✅ SUCCESS! WhatsApp message sent successfully!');
            console.log(`📱 Check WhatsApp on ${testPhoneNumber} for the OTP`);
        } else {
            console.log('❌ FAILED! Could not send WhatsApp message');
            console.log('💡 Check your API credentials and account balance');
        }

    } catch (error) {
        console.error('❌ Error testing WhatsApp service:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run test
testWhatsAppOTP();
