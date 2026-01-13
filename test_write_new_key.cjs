const axios = require('axios');

const NEW_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NWNlMTc0ZDcwNGI5ZGY2MGI0MDRhMCIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2NzY5NDcwOH0.1X77H7Rwhbu79EC_x2lYXvOAik6FqSjVPpG1YAzzQJc";
const ACCOUNT_ID = "67a4cf7a59bfb31e4a6560cb";
const BASE_URL = "https://v2.sabil.ly";

async function testWrite() {
    console.log("Testing POST with NEW KEY...");

    const config = {
        headers: {
            "Authorization": `apikey ${NEW_KEY}`,
            "X-ACCOUNT-ID": ACCOUNT_ID,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    };

    try {
        console.log("POST /api/contacts...");
        const res = await axios.post(`${BASE_URL}/api/contacts`, {
            name: "Test New Key",
            phone: "+218919998888"
        }, config);
        console.log(`✅ SUCCESS: ${res.status}`);
        console.log(JSON.stringify(res.data));
    } catch (err) {
        console.log(`❌ FAILED: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
    }
}

testWrite();
