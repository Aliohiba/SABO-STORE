import axios from 'axios';

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NTkxODM2OTcyZDNjZjNlOTg0ZWViYSIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2NzQ0NjU4Mn0.xvjKBcBDKKky7FIae5TQtz5WSEkkxzT8Nyqk0OYWa4g";
const ACCOUNT_ID = "67a4cf7a59bfb31e4a6560cb";
const BASE_URL = "https://v2.sabil.ly";

async function probeV2() {
    console.log("Probing Darb Sabil V2 API...");

    // Config for V2
    const headers = {
        "Authorization": `apikey ${API_KEY}`,
        "X-ACCOUNT-ID": ACCOUNT_ID,
        "X-API-VERSION": "1.0.0",
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    // Try a safe read-only endpoint
    // /api/local/shipments usually lists shipments
    const route = "/api/local/shipments?limit=1";

    try {
        console.log(`GET ${BASE_URL}${route}...`);
        const response = await axios({
            method: "GET",
            url: `${BASE_URL}${route}`,
            headers: headers,
            timeout: 5000
        });
        console.log(`[SUCCESS] Status ${response.status}`);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error(`[FAILED] Status ${error.response?.status}`);
        if (error.response?.data) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

probeV2();
