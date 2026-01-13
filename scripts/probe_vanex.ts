
import axios from 'axios';

const VANEX_API_URL = 'https://app.vanex.ly/api/v1';
const TOKEN = "65010|I8fRdiZCjEUUBKn0Xk1BNAmy9TWAjXpm4XmUALkz"; // User provided token

async function probe() {
    console.log("Probing Vanex API Lookups...");

    const endpoints = [
        '/payment-methods',
        '/payment-types',
        '/lookups',
        '/lists',
        '/customer/package/create',
        '/constants'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`Checking GET ${endpoint}...`);
            const response = await axios.get(`${VANEX_API_URL}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    Accept: 'application/json'
                }
            });
            console.log(`✅ Success ${endpoint}:`, response.status);
            // Log structure
            console.log(JSON.stringify(response.data, null, 2).substring(0, 500) + "...");
        } catch (e: any) {
            console.log(`❌ Failed ${endpoint}:`, e.response?.status || e.message);
        }
    }
}

probe();
