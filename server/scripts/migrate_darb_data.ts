import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongoDB, disconnectMongoDB } from '../mongodb';
import { City, Region } from '../schemas-extended';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read from darb_all_cities.json if exists, otherwise darb_tripoli.json
const ALL_CITIES_PATH = path.resolve(__dirname, '../data/darb_all_cities.json');
const TRIPOLI_PATH = path.resolve(__dirname, '../data/darb_tripoli.json');

function parseNodeName(nodeStr: string): { name: string, price: number } {
    // Parse "Area Name Price" -> { name: "Area Name", price: Price }
    const parts = nodeStr.trim().split(' ');
    const lastPart = parts[parts.length - 1];
    const price = parseInt(lastPart, 10);

    if (!isNaN(price)) {
        parts.pop();
        return { name: parts.join(' ').trim(), price: price };
    }

    return { name: nodeStr.trim(), price: 0 };
}

function cleanCityName(branchId: string): string {
    // Remove numbers and extra text from branchId
    // "طرابلس 1" -> "طرابلس"
    // "المنطقة الشرقية 2" -> "المنطقة الشرقية" (we'll handle this differently)
    return branchId.replace(/\s+\d+$/, '').trim();
}

async function migrateDarb() {
    try {
        console.log("Connecting to MongoDB...");
        await connectMongoDB();

        // Check which file exists
        let dataFilePath = ALL_CITIES_PATH;
        if (!fs.existsSync(ALL_CITIES_PATH)) {
            console.log(`${ALL_CITIES_PATH} not found, using ${TRIPOLI_PATH}`);
            dataFilePath = TRIPOLI_PATH;
        }

        if (!fs.existsSync(dataFilePath)) {
            throw new Error(`No data file found. Please create ${ALL_CITIES_PATH}`);
        }

        const rawData = fs.readFileSync(dataFilePath, 'utf-8');
        const darbData = JSON.parse(rawData);

        console.log(`Processing ${darbData.length} records...`);

        // Group by branchId
        const dataByBranch: Record<string, typeof darbData> = {};
        for (const item of darbData) {
            const branchId = item.branchId;
            if (!dataByBranch[branchId]) {
                dataByBranch[branchId] = [];
            }
            dataByBranch[branchId].push(item);
        }

        console.log(`Found ${Object.keys(dataByBranch).length} branches`);

        for (const [branchId, items] of Object.entries(dataByBranch)) {
            const cleanedBranch = cleanCityName(branchId);
            console.log(`\nProcessing Branch: ${branchId}`);

            // Strategy: Try to find existing city by name match
            // If branchId contains a known city name, use it
            // Otherwise, use the node name as city+region

            for (const item of items) {
                const { name: regionName, price } = parseNodeName(item.node);
                const darbId = String(item.b2nPackageId);
                const finalPrice = price > 0 ? price : (item.amountTo || 0);

                // Try to find or create city
                // First check if regionName matches a city
                let city = await City.findOne({ name: regionName });

                if (!city) {
                    // Check if cleaned branch name matches a city
                    city = await City.findOne({ name: cleanedBranch });
                }

                if (!city) {
                    // Try exact branchId match
                    city = await City.findOne({ name: branchId });
                }

                if (city) {
                    // Update city Darb info
                    city.darbId = branchId;
                    if (!city.darbPrice || city.darbPrice === 0) {
                        city.darbPrice = finalPrice;
                    }
                    await city.save();

                    // Add region to this city
                    await Region.findOneAndUpdate(
                        { cityId: city._id, name: regionName },
                        {
                            cityId: city._id,
                            name: regionName,
                            darbPrice: finalPrice,
                            darbId: darbId
                        },
                        { upsert: true }
                    );
                    console.log(`  ✓ ${city.name} -> ${regionName} (${finalPrice} LYD)`);
                } else {
                    // City not found - create new one using findOneAndUpdate with upsert
                    console.log(`  ! Creating/Updating city: ${regionName}`);
                    const newCity = await City.findOneAndUpdate(
                        { name: regionName }, // Find by name
                        {
                            name: regionName,
                            deliveryPrice: finalPrice,
                            darbPrice: finalPrice,
                            darbId: branchId,
                            active: true
                        },
                        { upsert: true, new: true }
                    );

                    // Add region with same name
                    await Region.findOneAndUpdate(
                        { cityId: newCity._id, name: regionName },
                        {
                            cityId: newCity._id,
                            name: regionName,
                            darbPrice: finalPrice,
                            darbId: darbId
                        },
                        { upsert: true }
                    );
                }
            }
        }

        console.log("\n✅ Darb Sabil migration completed successfully.");

    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await disconnectMongoDB();
        process.exit(0);
    }
}

migrateDarb();
