
import axios from 'axios';

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NWZlNjk5YjhjYzhiNzcxYWM3MmQyNCIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2Nzg5MjYzM30.NMmqNmPugkOJbcSlAXP9DEeR2x_OFzfGAxqdkz4M5QM";
const ACCOUNT_ID = "67a4cf7a59bfb31e4a6560cb";
const BASE_URL = "https://v2.sabil.ly";

async function fetchCities() {
    // List of potential endpoints to probe based on JSON structure
    const endpoints = [
        '/api/v1/city-nodes/available', // From old script
        '/api/wallet/metadata', // Known to exist (check auth)
        '/api/import/metadata',
        '/api/local/metadata',
        '/api/shipping/metadata',
        '/api/virtual/shipping/metadata',
        '/api/lookups/city', // Singular?
        '/api/public/lookups/cities',
        '/api/account/metadata',
    ];

    const config = {
        headers: {
            "Authorization": `apikey ${API_KEY}`,
            "X-ACCOUNT-ID": ACCOUNT_ID,
            "X-API-VERSION": "1.0.0",
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        validateStatus: () => true
    };

    console.log(`Targeting Base URL: ${BASE_URL}`);

    for (const endpoint of endpoints) {
        try {
            const url = `${BASE_URL}${endpoint}`;
            process.stdout.write(`GET ${endpoint} ... `);
            const response = await axios.get(url, config);
            console.log(`${response.status}`);

            if (response.status >= 200 && response.status < 300) {
                console.log('✅ SUCCESS!');
                console.log('Data Preview:', JSON.stringify(response.data).slice(0, 300));
            } else if (response.status === 402) {
                console.log('⚠️  402 Payment Required (Endpoint exists but account blocked?)');
            }
        } catch (error: any) {
            console.log(`Exception: ${error.message}`);
        }
    }
}

fetchCities();
