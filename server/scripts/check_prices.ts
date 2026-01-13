import { connectMongoDB, disconnectMongoDB } from '../mongodb';
import { City } from '../schemas-extended';

async function checkPrices() {
    try {
        console.log("Connecting to MongoDB...");
        await connectMongoDB();

        const cities = await City.find({ active: true }).sort({ name: 1 });

        console.log("\n📊 Current City Prices:\n");
        console.log("City Name | Vanex Price | Darb Price");
        console.log("----------|-------------|------------");

        for (const city of cities) {
            console.log(`${city.name.padEnd(20)} | ${(city.deliveryPrice || 0).toString().padEnd(11)} | ${(city.darbPrice || 0).toString()}`);
        }

        console.log(`\nTotal cities: ${cities.length}`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await disconnectMongoDB();
        process.exit(0);
    }
}

checkPrices();
