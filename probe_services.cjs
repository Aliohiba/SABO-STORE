const axios = require('axios');

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NWNlODExZDcwNGI5ZGY2MGI0MTY3MCIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2NzY5NjQwMX0.Mty8iFDSs7zdsx7JVWJWyDt-lu1uy1k-CCSoJRMiZx8";
const ACCOUNT_ID = "67a4cf7a59bfb31e4a6560cb";
const BASE_URL = "https://v2.sabil.ly";

async function probeServices() {

    const endpoints = [
        "/api/local/services",
        "/api/b2n/packages",
        "/api/packages",
        "/api/services",
        "/api/public/services",
        "/api/branches",
        "/api/my-branches" // sometimes used
    ];

    const headers = {
        "Authorization": `apikey ${API_KEY}`,
        "X-ACCOUNT-ID": ACCOUNT_ID,
        "Accept": "application/json"
    };

    console.log("🔍 Probing Service/Package Endpoints...");

    for (const ep of endpoints) {
        try {
            console.log(`Checking GET ${ep}...`);
            const res = await axios.get(`${BASE_URL}${ep}`, { headers });
            console.log(`✅ FOUND ${ep}: Status ${res.status}`);
            console.log(`   Data: ${JSON.stringify(res.data).slice(0, 200)}`);
        } catch (err) {
            console.log(`❌ ${ep} Failed: ${err.response?.status || err.message}`);
        }
    }
}

probeServices();
