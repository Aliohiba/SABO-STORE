import { connectMongoDB, disconnectMongoDB } from '../mongodb';
import { City, Region } from '../schemas-extended';

// Actual prices from Vanex website
const VANEX_CITY_PRICES: Record<string, number> = {
    'طرابلس': 15,
    'بنغازي': 30,
    'سبها': 30,
    'مصراتة': 25,
    'الزاوية': 25,
    'جنزور': 20,
    'صرمان': 25,
    'صبراتة': 25,
    'العجيلات': 30,
    'زوارة': 30,
    'الجميل': 30,
    'رقدالين': 30
};

// Special region prices for Tripoli
const TRIPOLI_REGION_PRICES: Record<string, number> = {
    'طريق المطار': 20,
    'خلة الفرجان': 20,
    'طريق المشتل': 20,
    'ولي العهد': 20,
    'السدرة': 20,
    'عين زارة': 20,
    'الهضبة المشروع': 20
};

// Special region prices for Benghazi
const BENGHAZI_REGION_PRICES: Record<string, number> = {
    'دقادوستا': 25,
    'ثاكنس': 35,
    'الرجمة': 35,
    'جردينة': 35,
    'المقزحة': 35,
    'بو مريم': 35
};

async function updateVanexPrices() {
    try {
        console.log("Connecting to MongoDB...");
        await connectMongoDB();

        console.log("\n📊 Updating Vanex city prices...\n");

        for (const [cityName, price] of Object.entries(VANEX_CITY_PRICES)) {
            const city = await City.findOne({ name: cityName });
            if (city) {
                city.deliveryPrice = price;
                await city.save();
                console.log(`✅ Updated ${cityName}: ${price} د.ل`);
            } else {
                console.log(`⚠️  City not found: ${cityName}`);
            }
        }

        console.log("\n📍 Updating Tripoli region prices...\n");
        const tripoli = await City.findOne({ name: 'طرابلس' });
        if (tripoli) {
            for (const [regionName, price] of Object.entries(TRIPOLI_REGION_PRICES)) {
                const region = await Region.findOneAndUpdate(
                    { cityId: tripoli._id, name: regionName },
                    { deliveryPrice: price },
                    { new: true }
                );
                if (region) {
                    console.log(`✅ Updated ${regionName}: ${price} د.ل`);
                }
            }
        }

        console.log("\n📍 Updating Benghazi region prices...\n");
        const benghazi = await City.findOne({ name: 'بنغازي' });
        if (benghazi) {
            for (const [regionName, price] of Object.entries(BENGHAZI_REGION_PRICES)) {
                const region = await Region.findOneAndUpdate(
                    { cityId: benghazi._id, name: regionName },
                    { deliveryPrice: price },
                    { new: true }
                );
                if (region) {
                    console.log(`✅ Updated ${regionName}: ${price} د.ل`);
                }
            }
        }

        console.log("\n✅ Vanex prices updated successfully!");

    } catch (error) {
        console.error("❌ Update failed:", error);
    } finally {
        await disconnectMongoDB();
        process.exit(0);
    }
}

updateVanexPrices();
