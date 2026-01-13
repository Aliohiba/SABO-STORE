import axios from 'axios';

const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NWNkZGRmZDcwNGI5ZGY2MGIzZmJhOCIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2NzY5Mzc5MX0.n0LNXUJHCCVLxwb5NuVs46FDSWm7IRtr9uAUH9V93KY";
const BASE_URL = "https://api.sabil.ly";

const routes = [
    "/v1/city-nodes/available",
    "/v1/cities",
    "/v1/branches",
    "/v1/user/profile",
    "/v1/profile",
    "/api/v1/city-nodes/available",
    "/city-nodes/available",
    "/v1/orders" // GET orders?
];

async function probe() {
    console.log("Probing Darb Sabil API...");

    for (const route of routes) {
        try {
            console.log(`Trying ${route}...`);
            const response = await axios({
                method: "GET",
                url: `${BASE_URL}${route}`,
                headers: {
                    "Authorization": `Bearer ${API_TOKEN}`,
                    "Accept": "application/json"
                },
                timeout: 5000
            });
            console.log(`[SUCCESS] ${route}: Status ${response.status}`);
            console.log(JSON.stringify(response.data).substring(0, 100));
        } catch (error) {
            const status = error.response ? error.response.status : "Unknown";
            const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            console.log(`[FAILED] ${route}: Status ${status} - ${msg.substring(0, 100)}`);
        }
    }
}

probe();
