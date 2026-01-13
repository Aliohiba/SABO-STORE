import axios from 'axios';

const VANEX_API_URL = 'https://app.vanex.ly/api/v1';
const TOKEN = '64179|GHtwXANe1uL4gV1HGTBjmjTmUoGw8FgUxxqma2RA'; // obtained via manual curl

async function fetchCities() {
    try {
        console.log('Fetching cities with token...');
        const response = await axios.get(`${VANEX_API_URL}/city/all`, {
            headers: { Authorization: `Bearer ${TOKEN}` },
        });
        const cities = response.data?.data || [];
        console.log('CITIES_START');
        console.log(JSON.stringify(cities, null, 2));
        console.log('CITIES_END');
    } catch (error: any) {
        console.error('Error fetching cities:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

fetchCities();
