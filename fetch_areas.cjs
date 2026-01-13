const axios = require('axios');

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NWNlMTc0ZDcwNGI5ZGY2MGI0MDRhMCIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2NzY5NDcwOH0.1X77H7Rwhbu79EC_x2lYXvOAik6FqSjVPpG1YAzzQJc";
const ACCOUNT_ID = "67a4cf7a59bfb31e4a6560cb";
const BASE_URL = "https://v2.sabil.ly";

async function fetchAreas() {
    try {
        const config = {
            headers: {
                "Authorization": `apikey ${API_KEY}`,
                "X-ACCOUNT-ID": ACCOUNT_ID,
                "X-API-VERSION": "1.0.0",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };

        console.log("1. GET /api/local/shipments...");
        const listRes = await axios.get(`${BASE_URL}/api/local/shipments?limit=1`, config);
        console.log(`✅ GET Success: ${listRes.status}`);

        console.log("\n2. POST /api/contacts...");
        const postRes = await axios.post(`${BASE_URL}/api/contacts`, {
            name: "Probe",
            phone: "+218915555555"
        }, config);
        console.log(`✅ POST Success: ${postRes.status}`);

        if (listRes.data.data?.results?.length > 0) {
            const areas = {};
            listRes.data.data.results.forEach(s => {
                if (s.to && s.to.city && s.to.area) {
                    if (!areas[s.to.city]) areas[s.to.city] = new Set();
                    areas[s.to.city].add(s.to.area);
                }
            });

            console.log("\nFOUND AREAS BY CITY:");
            for (const city in areas) {
                console.log(`\nCity: ${city}`); // Should be in Arabic
                console.log(`Areas: ${Array.from(areas[city]).join(", ")}`);
            }
        } else {
            console.log("No shipments found.");
        }

    } catch (error) {
        console.error("Failed:", error.message);
    }
}

fetchAreas();
