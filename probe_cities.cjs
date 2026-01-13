const axios = require('axios');

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NWNlODExZDcwNGI5ZGY2MGI0MTY3MCIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2NzY5NjQwMX0.Mty8iFDSs7zdsx7JVWJWyDt-lu1uy1k-CCSoJRMiZx8";
const ACCOUNT_ID = "67a4cf7a59bfb31e4a6560cb";
const BASE_URL = "https://v2.sabil.ly";

async function probeEndpoints() {
    const endpoints = [
        "/api/cities",
        "/api/local/cities",
        "/api/list/cities",
        "/api/lookups/cities",
        "/api/common/cities",
        "/api/areas",
        "/api/regions",
        "/api/branches", // Sometimes areas are tied to branches
        "/api/branch/list"
    ];

    const headers = {
        "Authorization": `apikey ${API_KEY}`,
        "X-ACCOUNT-ID": ACCOUNT_ID,
        "Accept": "application/json"
    };

    console.log("🔍 Probing for Cities/Areas Endpoints...");

    for (const ep of endpoints) {
        try {
            console.log(`Checking GET ${ep}...`);
            const res = await axios.get(`${BASE_URL}${ep}`, { headers });
            console.log(`✅ FOUND ${ep}: Status ${res.status}`);
            const dataPreview = JSON.stringify(res.data).slice(0, 200);
            console.log(`   Data: ${dataPreview}`);
        } catch (err) {
            console.log(`❌ ${ep} Failed: ${err.response?.status || err.message}`);
        }
    }
}

probeEndpoints();
