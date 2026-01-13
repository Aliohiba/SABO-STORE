import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongoDB, disconnectMongoDB } from '../mongodb';
import { City } from '../schemas-extended';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateAllVanexPrices() {
    try {
        console.log("Connecting to MongoDB...");
        await connectMongoDB();

        // Read Vanex cities file
        const filePath = path.resolve(__dirname, '../data/vanex_cities.json');
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const vanexCities = JSON.parse(rawData);

        console.log(`\n📊 Updating ${vanexCities.length} Vanex city prices...\n`);

        let updated = 0;
        let notFound = 0;

        for (const vanexCity of vanexCities) {
            const city = await City.findOneAndUpdate(
                { name: vanexCity.name },
                {
                    deliveryPrice: vanexCity.price,
                    vanexId: vanexCity.id
                },
                { new: true }
            );

            if (city) {
                console.log(`✅ ${vanexCity.name}: ${vanexCity.price} د.ل`);
                updated++;
            } else {
                console.log(`⚠️  Not found: ${vanexCity.name}`);
                notFound++;
            }
        }

        console.log(`\n✅ Updated ${updated} cities`);
        console.log(`⚠️  Not found: ${notFound} cities`);

    } catch (error) {
        console.error("❌ Update failed:", error);
    } finally {
        await disconnectMongoDB();
        process.exit(0);
    }
}

updateAllVanexPrices();
