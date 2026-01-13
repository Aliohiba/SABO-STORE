
import axios from 'axios';

const VANEX_API_URL = 'https://app.vanex.ly/api/v1';
const email = "Aliohiba7@gmail.com";
const password = "Ali15101996ohiba";

async function testVanex() {
    try {
        console.log("Authenticating...");
        const authResponse = await axios.post(`${VANEX_API_URL}/authenticate`, {
            email,
            password
        });

        const token = authResponse.data.data.access_token || authResponse.data.data.token;
        console.log("Token obtained:", token ? "Yes" : "No");

        if (!token) {
            console.error("No token!");
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Test 1: Get Cities
        // console.log("\nFetching Cities...");
        // const citiesResponse = await axios.get(`${VANEX_API_URL}/cities`, { headers });
        // console.log("Cities response status:", citiesResponse.status);
        // // console.log("Cities data sample:", JSON.stringify(citiesResponse.data.data.slice(0, 2), null, 2));

        // Test 2: Try to get regions for Tripoli (ID 1)
        console.log("\nTest 1: Trying /regions?city_id=1...");
        try {
            const regionsResponse = await axios.get(`${VANEX_API_URL}/regions`, {
                headers,
                params: { city_id: 1 }
            });
            console.log("SUCCESS - Status:", regionsResponse.status);
            console.log("Regions data:", JSON.stringify(regionsResponse.data, null, 2).substring(0, 500));
        } catch (e: any) {
            console.log("FAILED - Status:", e.response?.status, e.response?.statusText);
        }

        console.log("\nTest 2: Trying /cities/1/regions...");
        try {
            const regionsResponse = await axios.get(`${VANEX_API_URL}/cities/1/regions`, { headers });
            console.log("SUCCESS - Status:", regionsResponse.status);
            console.log("Regions data:", JSON.stringify(regionsResponse.data, null, 2).substring(0, 500));
        } catch (e: any) {
            console.log("FAILED - Status:", e.response?.status, e.response?.statusText);
        }

        console.log("\nTest 3: Trying /customer/regions?city_id=1...");
        try {
            const regionsResponse = await axios.get(`${VANEX_API_URL}/customer/regions`, {
                headers,
                params: { city_id: 1 }
            });
            console.log("SUCCESS - Status:", regionsResponse.status);
            console.log("Regions data:", JSON.stringify(regionsResponse.data, null, 2).substring(0, 500));
        } catch (e: any) {
            console.log("Failed /regions?city_id=1:", e.response?.status, e.response?.statusText);
        }

    } catch (error: any) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

testVanex();
