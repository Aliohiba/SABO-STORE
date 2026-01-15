
import axios from "axios";
import https from "https";

// Create an agent with insecure parser enabled
const agent = new https.Agent({
    // @ts-ignore
    insecureHTTPParser: true,
    rejectUnauthorized: false
});

const API_KEY = "48|7CUxhvKerwK3BKcgF1DQht86KjEAVqrYs6N0LDQwdca80521";
const BASE_URL = "https://fulus.ly/api/v1";

async function testCurrency(currency: string) {
    const url = `${BASE_URL}/rates/current?currency=${currency}`;
    console.log(`\nTesting: ${url}`);

    try {
        const response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Accept": "application/json"
            },
            httpsAgent: agent,
            transitional: {
                insecureHTTPParser: true
            }
        });

        console.log(`Status: ${response.status}`);
        console.log("Data:", JSON.stringify(response.data, null, 2));

    } catch (error: any) {
        console.error("Axios Error:", error.message);
        if (error.response) {
            console.log("Response Status:", error.response.status);
            console.log("Response Data:", JSON.stringify(error.response.data));
        }
    }
}

async function run() {
    await testCurrency("USD");
    await testCurrency("EUR");
    await testCurrency("GBP");
}

run();
