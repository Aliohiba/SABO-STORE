const axios = require('axios');

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NWNlODExZDcwNGI5ZGY2MGI0MTY3MCIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImF1ZCI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2NzY5NjQwMX0.Mty8iFDSs7zdsx7JVWJWyDt-lu1uy1k-CCSoJRMiZx8";
const ACCOUNT_ID = "67a4cf7a59bfb31e4a6560cb";
const BASE_URL = "https://v2.sabil.ly";

async function verifyKey() {
    console.log("🔍 Verifying NEW API Key for READ and WRITE...");

    const headers = {
        "Authorization": `apikey ${API_KEY}`,
        "X-ACCOUNT-ID": ACCOUNT_ID,
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    try {
        // 1. Test Read (GET)
        console.log("1️⃣ Testing GET /api/transactions (as proxy for auth check)...");
        // Using a safe endpoint from your collection: /api/wallet/transactions/all/LYD?limit=1
        // Or if that fails, try /api/local/shipments if available.
        // Let's try to search user first or something generic.
        // Actually, let's try 'contacts' GET if it exists or 'shipments' GET.
        // Based on previous logs, GET /api/local/shipments gave 200 or 404 depending on key.

        try {
            const res = await axios.get(`${BASE_URL}/api/local/shipments?limit=1`, { headers });
            console.log(`✅ READ Success (Shipments): Status ${res.status}`);
        } catch (err) {
            console.log(`❌ READ Failed (Shipments): ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
            // Attempt Wallet Balance read as backup since user shared wallet collection
            try {
                const res = await axios.get(`${BASE_URL}/api/wallet/balance/main/LYD`, { headers });
                console.log(`✅ READ Success (Wallet): Status ${res.status}`);
            } catch (wErr) {
                console.log(`❌ READ Failed (Wallet): ${wErr.response?.status}`);
            }
        }

        // 2. Test Write (POST Contact)
        console.log("\n2️⃣ Testing POST /api/contacts (Write Check)...");
        const contactPayload = {
            name: "API Test User",
            phone: "+218911234567"
        };
        const writeRes = await axios.post(`${BASE_URL}/api/contacts`, contactPayload, { headers });
        console.log(`✅ WRITE Success: Status ${writeRes.status}`);
        console.log("Response Data:", JSON.stringify(writeRes.data));

    } catch (err) {
        console.log(`❌ WRITE Failed: ${err.response?.status}`);
        if (err.response?.data) {
            console.log("Error Body:", JSON.stringify(err.response.data));
        } else {
            console.log("Error:", err.message);
        }
    }
}

verifyKey();
