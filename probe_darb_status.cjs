const axios = require('axios');

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NjIxYTg4NzczOGU4MTA1ZmE2MmY3NiIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2ODAzNzAwMH0.TvQVlYbX2hGUgYoQ4XzcP__55GsIy_DbKVbjdrtbu58";
const ACCOUNT_ID = "67a4cf7a59bfb31e4a6560cb";
const BASE_URL = "https://v2.sabil.ly";

async function checkApi() {
    console.log("Checking Darb Sabil API Connectivity...");

    const checkEndpoint = async (method, url, data = null) => {
        try {
            console.log(`📡 ${method} ${url}`);
            const response = await axios({
                method,
                url: `${BASE_URL}${url}`,
                headers: {
                    "Authorization": `apikey ${API_KEY}`,
                    "X-ACCOUNT-ID": ACCOUNT_ID,
                    "X-API-VERSION": "1.0.0",
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                data
            });
            console.log(`✅ Success for ${url}:`, response.status);
            return true;
        } catch (error) {
            console.error(`❌ Error for ${url}:`, error.response ? `${error.response.status} ${error.response.statusText}` : error.message);
            if (error.response && error.response.status === 502) {
                console.log("⚠️ Received 502 Bad Gateway - API Server Issue");
            }
            return false;
        }
    };

    // 1. Try GET Contacts (Search) - usually lighter
    await checkEndpoint('GET', '/api/contacts?limit=1');

    // 2. Try POST Contact (The one that failed for user)
    // using a dummy timestamp to avoid duplicate errors if it works
    const dummyPhone = "+21899" + Math.floor(1000000 + Math.random() * 9000000);
    await checkEndpoint('POST', '/api/contacts', {
        name: "Test Connectivity",
        phone: dummyPhone
    });
}

checkApi();
