import { connectMongoDB, disconnectMongoDB } from '../mongodb';
import { City } from '../schemas-extended';

async function showPrices() {
    try {
        await connectMongoDB();

        // Check specific cities
        const testCities = ['طرابلس', 'بنغازي', 'مصراتة', 'الزاوية', 'سبها'];

        for (const cityName of testCities) {
            const city = await City.findOne({ name: cityName });
            if (city) {
                console.log(`${cityName}: Vanex=${city.deliveryPrice}, Darb=${city.darbPrice || 'N/A'}`);
            } else {
                console.log(`${cityName}: NOT FOUND`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await disconnectMongoDB();
        process.exit(0);
    }
}

showPrices();
