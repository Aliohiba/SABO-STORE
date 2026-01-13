
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongoDB, disconnectMongoDB } from '../mongodb';
import { City, Region } from '../schemas-extended';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VANEX_CITIES_PATH = path.resolve(__dirname, '../data/vanex_cities.json');
const CITY_REGIONS_PATH = path.resolve(__dirname, '../data/city_regions.json');

async function migrate() {
    try {
        console.log("Connecting to MongoDB...");
        await connectMongoDB();

        console.log("Reading data files...");
        if (!fs.existsSync(VANEX_CITIES_PATH)) {
            throw new Error(`Cities file not found at ${VANEX_CITIES_PATH}`);
        }
        if (!fs.existsSync(CITY_REGIONS_PATH)) {
            throw new Error(`Regions file not found at ${CITY_REGIONS_PATH}`);
        }

        const citiesRaw = fs.readFileSync(VANEX_CITIES_PATH, 'utf-8');
        const citiesData = JSON.parse(citiesRaw);

        const regionsRaw = fs.readFileSync(CITY_REGIONS_PATH, 'utf-8');
        const regionsData = JSON.parse(regionsRaw);

        console.log(`Found ${citiesData.length} cities to process.`);

        for (const city of citiesData) {
            const vanexId = city.id;
            const name = city.name;
            const price = city.price || 0;

            console.log(`Processing City: ${name} (Vanex ID: ${vanexId})`);

            // Upsert City
            // We use name as the unique key to prevent duplicates
            const cityDoc = await City.findOneAndUpdate(
                { name: name },
                {
                    name: name,
                    vanexId: vanexId,
                    deliveryPrice: price,
                    active: true
                },
                { upsert: true, new: true }
            );

            // Process Regions for this city
            // regionsData is keyed by Vanex City ID as string
            const cityRegionsInfo = regionsData[String(vanexId)];

            if (cityRegionsInfo && cityRegionsInfo.regions) {
                const regionsList = cityRegionsInfo.regions;
                console.log(`  > Found ${regionsList.length} regions for ${name}`);

                for (const region of regionsList) {
                    await Region.findOneAndUpdate(
                        { cityId: cityDoc._id, name: region.name },
                        {
                            cityId: cityDoc._id,
                            name: region.name
                        },
                        { upsert: true }
                    );
                }
            } else {
                console.log(`  > No regions found for ${name} (ID: ${vanexId})`);
            }
        }

        console.log("Migration completed successfully.");

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await disconnectMongoDB();
        process.exit(0);
    }
}

migrate();
