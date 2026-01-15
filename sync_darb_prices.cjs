/**
 * Sync Darb Sabil Prices to MongoDB
 * 
 * This script reads the CITY_AREAS data from darb_sabil.ts
 * and updates the MongoDB database with the correct prices.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aliohiba7:Ali15101996ohiba@sabo.x3bbofa.mongodb.net/?appName=SABO';

// Darb Sabil prices (copied from server/services/darb_sabil.ts)
const CITY_AREAS = {
    "طرابلس": [
        { name: "المدينة", price: 10 }, { name: "جنزور", price: 15 }, { name: "السياحية", price: 15 },
        { name: "طريق المشتل", price: 15 }, { name: "مشروع الهضبة", price: 15 }, { name: "الدعوة الإسلامية", price: 15 },
        { name: "تاجوراء", price: 15 }, { name: "البيفي", price: 15 }, { name: "صلاح الدين", price: 15 },
        { name: "عين زارة", price: 15 }, { name: "الهضبة البدري", price: 15 }, { name: "طريق الفلاح", price: 10 },
        { name: "الهضبة الخضراء", price: 15 }, { name: "طريق المطار", price: 15 }, { name: "قرقارش", price: 15 },
        { name: "بوابة الجبس", price: 15 }, { name: "الهضبة طول", price: 15 }, { name: "الكيزة", price: 15 },
        { name: "غوط الشعال", price: 15 }, { name: "السراج", price: 15 }, { name: "أربعة شوارع الجلدية", price: 15 },
        { name: "النجيلة", price: 20 }, { name: "السواني", price: 20 }, { name: "الكريمية", price: 20 },
        { name: "حي الأندلس", price: 10 }, { name: "قرجي", price: 10 }, { name: "ابوسليم", price: 10 },
        { name: "حي الاكواخ", price: 10 }, { name: "الفرناج", price: 10 }, { name: "زناتة", price: 10 },
        { name: "الظهرة", price: 10 }, { name: "شارع النصر", price: 10 }, { name: "رأس حسن", price: 10 },
        { name: "بن عاشور", price: 10 }, { name: "جرابة", price: 10 }, { name: "شارع الظل", price: 10 },
        { name: "الهاني", price: 10 }, { name: "عرادة", price: 10 },
        { name: "سوق الجمعة", price: 10 }, { name: "البطاطا", price: 10 }, { name: "حي دمشق", price: 10 },
        { name: "طريق الصور", price: 10 }, { name: "السيدي", price: 10 }, { name: "النوفليين", price: 10 },
        { name: "طريق الشوك", price: 10 }, { name: "السبعة", price: 10 }, { name: "وادي الربيع", price: 20 },
        { name: "الخلة", price: 20 }, { name: "سوق السبت", price: 20 },
        { name: "الغرارات", price: 10 }, { name: "معيتيقة", price: 10 }, { name: "طريق عشرين رمضان", price: 10 },
        { name: "فشلوم", price: 10 }, { name: "باب العزيزية", price: 10 }, { name: "باب عكارة", price: 10 },
        { name: "شارع الجمهورية", price: 10 }, { name: "المنصورة", price: 10 }, { name: "غرغور", price: 10 },
        { name: "الدريبي", price: 10 }, { name: "باب بن غشير", price: 10 }, { name: "العزيزية", price: 20 },
        { name: "الساعدية", price: 20 }, { name: "الزهراء", price: 20 }, { name: "سوق الخميس مسيحل", price: 20 },
        { name: "السبيعة", price: 20 }, { name: "الرياضية", price: 10 }, { name: "كشلاف", price: 10 },
        { name: "الباعيش", price: 20 }, { name: "زاوية الدهماني", price: 10 }, { name: "الحي الإسلامي", price: 10 },
        { name: "شارع الزاوية", price: 10 }, { name: "خلة فارس", price: 15 }, { name: "جنزور شعبية عبدالجليل", price: 10 },
        { name: "بئر التوتة", price: 20 }, { name: "السهلة", price: 15 }, { name: "تاجوراء بئير العالم", price: 15 },
        { name: "سيد السائح", price: 20 }, { name: "الهضبة الشرقية", price: 10 }, { name: "صياد", price: 15 },
        { name: "طريق المطار الرملة", price: 15 }, { name: "غوط الرمان", price: 20 }, { name: "الأحياء البرية", price: 15 },
        { name: "النشيع", price: 15 }, { name: "عمر المختار", price: 10 }
    ],
    "بنغازي": [
        { name: "بنغازي", price: 30 }, { name: "الرحبة", price: 30 }, { name: "توتكرة", price: 35 },
        { name: "الرجمة", price: 30 }, { name: "قمينس", price: 40 }, { name: "المقزحة", price: 30 },
        { name: "سلوق", price: 40 }
    ],
    "مصراتة": [
        { name: "مصراتة", price: 20 }, { name: "تاورغاء", price: 30 }, { name: "الدافنية", price: 20 },
        { name: "بوقرين", price: 30 }
    ]
    // ... (truncated for brevity - add all cities from darb_sabil.ts)
};

async function syncPrices() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!');

        // Define schemas
        const City = mongoose.model('City', new mongoose.Schema({}, { strict: false }));
        const Region = mongoose.model('Region', new mongoose.Schema({}, { strict: false }));

        let citiesUpdated = 0;
        let regionsUpdated = 0;
        let errors = 0;

        // Process each city
        for (const [cityName, areas] of Object.entries(CITY_AREAS)) {
            console.log(`\n📍 Processing: ${cityName}`);

            // Find city in database
            const city = await City.findOne({ name: cityName });

            if (!city) {
                console.log(`  ⚠️  City not found: ${cityName}`);
                continue;
            }

            //Update city darbPrice (lowest price in areas)
            const cityBasePrice = Math.min(...areas.map(a => a.price));

            if (city.darbPrice !== cityBasePrice) {
                await City.updateOne(
                    { _id: city._id },
                    { $set: { darbPrice: cityBasePrice } }
                );
                console.log(`  ✅ City price updated: ${city.darbPrice || 'none'} → ${cityBasePrice} د.ل`);
                citiesUpdated++;
            } else {
                console.log(`  ℹ️  City price already correct: ${cityBasePrice} د.ل`);
            }

            // Update regions
            for (const area of areas) {
                const region = await Region.findOne({
                    cityId: city._id,
                    name: area.name
                });

                if (!region) {
                    console.log(`    ⚠️  Region not found: ${area.name}`);
                    continue;
                }

                if (region.darbPrice !== area.price) {
                    await Region.updateOne(
                        { _id: region._id },
                        { $set: { darbPrice: area.price } }
                    );
                    console.log(`    ✅ ${area.name}: ${region.darbPrice || 'none'} → ${area.price} د.ل`);
                    regionsUpdated++;
                } else {
                    console.log(`    ℹ️  ${area.name}: ${area.price} د.ل (already correct)`);
                }
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Summary:');
        console.log(`  ✅ Cities updated: ${citiesUpdated}`);
        console.log(`  ✅ Regions updated: ${regionsUpdated}`);
        console.log(`  ❌ Errors: ${errors}`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Done!');
        process.exit(0);
    }
}

syncPrices();
