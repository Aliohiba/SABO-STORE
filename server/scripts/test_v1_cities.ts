
import axios from 'axios';

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NWZlNjk5YjhjYzhiNzcxYWM3MmQyNCIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2Nzg5MjYzM30.NMmqNmPugkOJbcSlAXP9DEeR2x_OFzfGAxqdkz4M5QM";

async function testV1() {
    const url = 'https://api.sabil.ly/v1/city-nodes/available';
    console.log(`Testing ${url} with new Key...`);

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            },
            validateStatus: () => true
        });
        console.log(`Status: ${response.status}`);
        console.log('Data:', JSON.stringify(response.data).slice(0, 200));
    } catch (error: any) {
        console.log(`Error: ${error.message}`);
    }
}

testV1();
