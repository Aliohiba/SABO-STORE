
import axios from 'axios';
import * as fs from 'fs';

const VANEX_API_URL = 'https://app.vanex.ly/api/v1';

async function testAuth() {
    console.log("Starting Auth Test...");
    const logData: string[] = [];
    const log = (msg: string) => { console.log(msg); logData.push(msg); };

    // 1. Test Real Credentials
    log("--- Test 1: Real Credentials ---");
    try {
        const response = await axios.post(`${VANEX_API_URL}/authenticate`, {
            email: "Aliohiba7@gmail.com",
            password: "Ali15101996ohiba"
        });
        log(`Status: ${response.status}`);
        log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
        log(`Error: ${error.message}`);
        if (error.response) log(`Error Data: ${JSON.stringify(error.response.data)}`);
    }

    // 2. Test Fake Credentials
    log("\n--- Test 2: Fake Credentials ---");
    try {
        const response = await axios.post(`${VANEX_API_URL}/authenticate`, {
            email: "fake_user_12345@gmail.com",
            password: "wrongpassword"
        });
        log(`Status: ${response.status}`);
        log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
        log(`Error: ${error.message}`);
        if (error.response) log(`Error Data: ${JSON.stringify(error.response.data)}`);
    }

    fs.writeFileSync('vanex_auth_test.log', logData.join('\n'));
    console.log("Done. Log saved to vanex_auth_test.log");
}

testAuth();
