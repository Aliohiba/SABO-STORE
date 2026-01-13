
import axios from 'axios';

const VANEX_API_URL = 'https://app.vanex.ly/api/v1';
const EMAIL = "Aliohiba7@gmail.com";
const PASSWORD = "Ali15101996ohiba";

async function fetchCities() {
    try {
        console.log("Authenticating...");
        const authResponse = await axios.post(`${VANEX_API_URL}/authenticate`, {
            email: EMAIL,
            password: PASSWORD,
        });

        const token = authResponse.data?.data?.token;
        if (!token) {
            console.error("No token received");
            return;
        }
        console.log("Authenticated. Token acquired.");

        console.log("Fetching cities...");
        const citiesResponse = await axios.get(`${VANEX_API_URL}/city/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const cities = citiesResponse.data?.data || [];
        console.log("CITIES_START");
        console.log(JSON.stringify(cities, null, 2));
        console.log("CITIES_END");

    } catch (error: any) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
    }
}

fetchCities();
