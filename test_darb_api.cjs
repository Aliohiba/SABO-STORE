// Test script for Darb Sabil API with updated key
// Usage: node test_darb_api.cjs

const axios = require('axios');

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NjIxYTg4NzczOGU4MTA1ZmE2MmY3NiIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImF1ZCI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2ODAzNzAwMH0.TvQVlYbX2hGUgYoQ4XzcP__55GsIy_DbKVbjdrtbu58";
const ACCOUNT_ID = "67a4cf7a59bfb31e4a6560cb";
const BASE_URL = "https://v2.sabil.ly";

async function testDarbAPI() {
    console.log('🧪 Testing Darb Sabil API with New Key...\n');

    console.log('📋 Configuration:');
    console.log('  BASE_URL:', BASE_URL);
    console.log('  ACCOUNT_ID:', ACCOUNT_ID);
    console.log('  API_KEY:', API_KEY.substring(0, 50) + '...');
    console.log('');

    // Test 1: Get Shipments (Basic connectivity test)
    console.log('📦 Test 1: Fetching Shipments List...');
    try {
        const response = await axios({
            method: 'GET',
            url: `${BASE_URL}/api/local/shipments?limit=5&offset=0`,
            headers: {
                "Authorization": `apikey ${API_KEY}`,
                "X-ACCOUNT-ID": ACCOUNT_ID,
                "X-API-VERSION": "1.0.0",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        console.log('✅ SUCCESS! Got response from Darb Sabil API');
        console.log('📊 Status:', response.status);
        console.log('📄 Data:', JSON.stringify(response.data, null, 2));
        console.log('');

        if (response.data?.data) {
            const shipments = Array.isArray(response.data.data) ? response.data.data : [];
            console.log(`📦 Total Shipments Found: ${shipments.length}`);
        }

        return true;
    } catch (error) {
        console.error('❌ FAILED to fetch shipments');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        return false;
    }
}

// Run test
testDarbAPI()
    .then(success => {
        console.log('');
        if (success) {
            console.log('🎉 Darb Sabil API is working correctly!');
            console.log('✅ The new API key is valid and authenticated.');
            console.log('');
            console.log('📝 Next Steps:');
            console.log('   1. Restart your server: npm run dev');
            console.log('   2. Test order creation from the website');
            console.log('   3. Verify shipment tracking');
        } else {
            console.log('❌ Darb Sabil API test failed!');
            console.log('💡 Possible Issues:');
            console.log('   - API key might be expired or invalid');
            console.log('   - Account ID might be incorrect');
            console.log('   - Network connectivity issues');
            console.log('   - API endpoint might have changed');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('💥 Unexpected error:', err);
        process.exit(1);
    });
