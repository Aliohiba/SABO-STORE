const axios = require('axios');

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NWNlODExZDcwNGI5ZGY2MGI0MTY3MCIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2NzY5NjQwMX0.Mty8iFDSs7zdsx7JVWJWyDt-lu1uy1k-CCSoJRMiZx8";
const ACCOUNT_ID = "67a4cf7a59bfb31e4a6560cb";
const URL = "https://v2.sabil.ly/api/local/shipments/calculate/shipping";

async function testCalculateEndpoint() {
    const headers = {
        "Authorization": `apikey ${API_KEY}`,
        "X-ACCOUNT-ID": ACCOUNT_ID,
        "Accept": "application/json",
        "Content-Type": "application/json"
    };

    console.log(`🔍 Probing ${URL}`);

    // 1. Try GET (Maybe it returns metadata?)
    try {
        console.log("👉 Attempting GET...");
        const getRes = await axios.get(URL, { headers });
        console.log(`✅ GET Success: ${getRes.status}`);
        console.log(`   Data: ${JSON.stringify(getRes.data).slice(0, 500)}`);
    } catch (err) {
        console.log(`❌ GET Failed: ${err.response?.status} - ${err.response?.statusText}`);
        if (err.response?.data) console.log(`   Error Body: ${JSON.stringify(err.response.data)}`);
    }

    // 2. Try POST with some dummy data to see if it calculates or reveals info
    try {
        console.log("\n👉 Attempting POST (Validation Check)...");
        const payload = {
            service: "6783c612dcf305c9e775c987", // Known good service ID
            to: {
                city: "طرابلس",
                area: "المدينة"
            },
            weight: 1
        };
        const postRes = await axios.post(URL, payload, { headers });
        console.log(`✅ POST Success: ${postRes.status}`);
        console.log(`   Result: ${JSON.stringify(postRes.data, null, 2)}`);
    } catch (err) {
        console.log(`❌ POST Failed: ${err.response?.status} - ${err.response?.statusText}`);
        if (err.response?.data) console.log(`   Error Body: ${JSON.stringify(err.response.data)}`);
    }
}

testCalculateEndpoint();
