import { connectMongoDB, disconnectMongoDB } from '../mongodb';
import { City, Region } from '../schemas-extended';

async function checkDarbData() {
    try {
        await connectMongoDB();

        // Get all cities with Darb Sabil data
        const darbCities = await City.find({ darbId: { $exists: true, $ne: null } });
        console.log(`\nCities with Darb Sabil data: ${darbCities.length}`);

        if (darbCities.length > 0) {
            console.log('\n--- Sample Darb Sabil Cities ---');
            darbCities.slice(0, 5).forEach((city, index) => {
                console.log(`${index + 1}. ${city.name} (darbId: ${city.darbId}, darbPrice: ${city.darbPrice} LYD)`);
            });
        }

        // Get all regions with Darb Sabil data
        const darbRegions = await Region.find({ darbId: { $exists: true, $ne: null } });
        console.log(`\nRegions with Darb Sabil data: ${darbRegions.length}`);

        if (darbRegions.length > 0) {
            console.log('\n--- Sample Darb Sabil Regions ---');
            const sampleRegions = darbRegions.slice(0, 10);
            for (const region of sampleRegions) {
                const city = await City.findById(region.cityId);
                console.log(`- ${region.name} (${city?.name}) - darbPrice: ${region.darbPrice} LYD`);
            }
        }

        // Get statistics for cities
        console.log('\n--- City Statistics ---');
        const citiesWithBothProviders = await City.find({
            vanexId: { $exists: true, $ne: null },
            darbId: { $exists: true, $ne: null }
        });
        console.log(`Cities with both Vanex and Darb Sabil data: ${citiesWithBothProviders.length}`);

        const citiesOnlyVanex = await City.find({
            vanexId: { $exists: true, $ne: null },
            darbId: { $exists: false }
        });
        console.log(`Cities with only Vanex data: ${citiesOnlyVanex.length}`);

        const citiesOnlyDarb = await City.find({
            darbId: { $exists: true, $ne: null },
            vanexId: { $exists: false }
        });
        console.log(`Cities with only Darb Sabil data: ${citiesOnlyDarb.length}`);

    } catch (error) {
        console.error("Error checking Darb data:", error);
    } finally {
        await disconnectMongoDB();
    }
}

checkDarbData();
