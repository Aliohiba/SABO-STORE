
import { connectMongoDB, disconnectMongoDB } from '../mongodb';
import { City, Region } from '../schemas-extended';

async function checkData() {
    try {
        await connectMongoDB();

        const allCities = await City.find({});
        const activeCities = await City.find({ active: true });
        const allRegions = await Region.find({});

        console.log(`Total Cities in DB: ${allCities.length}`);
        console.log(`Active Cities in DB: ${activeCities.length}`);
        console.log(`Total Regions in DB: ${allRegions.length}`);

        if (allCities.length > 0) {
            console.log("Sample Active City:", JSON.stringify(activeCities[0], null, 2));

            // Check regions for this city
            const cityRegions = await Region.find({ cityId: activeCities[0]._id });
            console.log(`Regions for first city (${activeCities[0].name}): ${cityRegions.length}`);
            if (cityRegions.length > 0) {
                console.log("Sample Region:", JSON.stringify(cityRegions[0], null, 2));
            }
        }

    } catch (error) {
        console.error("Error checking data:", error);
    } finally {
        await disconnectMongoDB();
    }
}

checkData();
