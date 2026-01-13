import axios from 'axios';

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NTgwNzVjOTcyZDNjZjNlOTgzY2Q1YiIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2NzM3NjczMywiZXhwIjoxODQ4NjA3MTk5LjEwN30.iKLIQ7y1vsyQfOWl4_9CyOSWSk3h5ZY3eBIW7i1lavs';

const BASE_URLS = [
    'https://api.sabil.ly',
    'https://api.sabil.ly/v1',
    'https://v2.sabil.ly/api',
    'https://v2.sabil.ly/api/v1',
    'https://app.sabil.ly/api',
    'https://sabil-api.tip.libyanspider.cloud/v1'
];

async function testConnection() {
    console.log('Testing Sabil API Connection...');

    for (const url of BASE_URLS) {
        try {
            console.log(`Trying ${url}/city-nodes/available ...`);
            const response = await axios.get(`${url}/city-nodes/available`, {
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                console.log(`SUCCESS! Connected to ${url}`);
                console.log('Response data sample:', JSON.stringify(response.data).substring(0, 200));
                return;
            }
        } catch (error: any) {
            console.log(`Failed ${url}: ${error.message} (${error.response?.status})`);
        }
    }

    console.log('All attempts failed.');
}

testConnection();
