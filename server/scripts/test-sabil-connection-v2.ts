import axios from 'axios';

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NTgwNzVjOTcyZDNjZjNlOTgzY2Q1YiIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2NzM3NjczMywiZXhwIjoxODQ4NjA3MTk5LjEwN30.iKLIQ7y1vsyQfOWl4_9CyOSWSk3h5ZY3eBIW7i1lavs';

const ENDPOINTS = [
    'https://api.sabil.ly/v1/city-nodes/available',
    'https://api.sabil.ly/api/v1/city-nodes/available',
    'https://app.sabil.ly/api/v1/city-nodes/available',
    'https://v2.sabil.ly/api/v1/city-nodes/available',
    'https://sabil-api.tip.libyanspider.cloud/v1/city-nodes/available'
];

async function test() {
    console.log("Starting Sabil Connectivity Test...");
    for (const url of ENDPOINTS) {
        try {
            console.log(`Testing: ${url}`);
            const res = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${TOKEN}` },
                timeout: 5000 // 5s timeout
            });
            console.log(`[SUCCESS] ${url} -> Status: ${res.status}`);
            console.log('Sample Data:', JSON.stringify(res.data).slice(0, 100));
            return; // Exit on first success
        } catch (err: any) {
            console.log(`[FAILED] ${url} -> ${err.message}`);
            if (err.response) {
                console.log(`   Response: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
            }
        }
    }
}

test();
