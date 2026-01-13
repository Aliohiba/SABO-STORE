import axios from 'axios';

const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NTgyY2YxOTcyZDNjZjNlOTgzZTNjNCIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImF1ZCI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2NzM4NjM1MywiZXhwIjoxODAxMzQ2Mzk4LjY3fQ.5XtfiUhjbhm2QkWdhIY_3ShsbeKeJYLaxkBkuxclsL0";
const BASE_URL = "https://api.sabil.ly";

async function probeLogin() {
    console.log("Probing Login Endpoints...");

    // Decoded payload hint: secretId
    const secretId = "69582cf1972d3cf3e983e3c4";

    const endpoints = [
        "/v1/auth/login",
        "/v1/login",
        "/oauth/token",
        "/api/auth/login"
    ];

    for (const route of endpoints) {
        try {
            console.log(`POST ${route}...`);
            const response = await axios({
                method: "POST",
                url: `${BASE_URL}${route}`,
                headers: { "Content-Type": "application/json" },
                data: {
                    secretId: secretId,
                    token: API_TOKEN,
                    grant_type: "client_credentials"
                },
                timeout: 5000
            });
            console.log(`[SUCCESS] ${route}: Status ${response.status}`);
            console.log(JSON.stringify(response.data));
        } catch (error) {
            const status = error.response ? error.response.status : "Unknown";
            // If 404, route doesn't exist. If 400/401/422, route exists but bad params.
            console.log(`[FAILED] ${route}: Status ${status}`);
        }
    }
}

probeLogin();
