import { connectMongoDB, disconnectMongoDB } from '../mongodb';
import { City, Region } from '../schemas-extended';

async function detailedRegionCheck() {
    try {
        await connectMongoDB();

        // Find "طرابلس 1" city
        const tripoliCity = await City.findOne({ name: "طرابلس 1" });

        if (tripoliCity) {
            console.log('\n=== طرابلس 1 (Tripoli 1) City Info ===');
            console.log(`City ID: ${tripoliCity._id}`);
            console.log(`Vanex ID: ${tripoliCity.vanexId || 'N/A'}`);
            console.log(`Darb ID: ${tripoliCity.darbId || 'N/A'}`);
            console.log(`Delivery Price (Vanex): ${tripoliCity.deliveryPrice || 'N/A'} LYD`);
            console.log(`Darb Price: ${tripoliCity.darbPrice || 'N/A'} LYD`);
            console.log(`Active: ${tripoliCity.active}`);

            // Get all regions for this city
            const regions = await Region.find({ cityId: tripoliCity._id });
            console.log(`\nTotal Regions: ${regions.length}`);

            // Show first 15 regions with their prices
            console.log('\n=== Sample Regions (First 15) ===');
            regions.slice(0, 15).forEach((region, index) => {
                console.log(`${index + 1}. ${region.name}`);
                console.log(`   - Darb Price: ${region.darbPrice || 'N/A'} LYD`);
                console.log(`   - Delivery Price (Vanex): ${region.deliveryPrice || 'N/A'} LYD`);
                console.log(`   - Active: ${region.active}`);
            });

            // Count regions by price
            const priceGroups: { [key: number]: number } = {};
            regions.forEach(region => {
                const price = region.darbPrice || 0;
                priceGroups[price] = (priceGroups[price] || 0) + 1;
            });

            console.log('\n=== Region Price Distribution ===');
            Object.entries(priceGroups).sort(([a], [b]) => Number(a) - Number(b)).forEach(([price, count]) => {
                console.log(`${price} LYD: ${count} regions`);
            });
        } else {
            console.log('طرابلس 1 city not found in database');
        }

        // Show all unique city names with Darb Sabil data
        const darbCities = await City.find({
            darbId: { $exists: true, $ne: null }
        }).select('name darbId darbPrice');

        console.log('\n=== All Cities with Darb Sabil Data ===');
        darbCities.forEach((city, index) => {
            console.log(`${index + 1}. ${city.name} (darbId: ${city.darbId}, price: ${city.darbPrice || 'varies'} LYD)`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await disconnectMongoDB();
    }
}

detailedRegionCheck();
