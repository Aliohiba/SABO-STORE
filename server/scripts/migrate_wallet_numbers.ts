
import mongoose from 'mongoose';
import { Customer } from '../schemas';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://aliohiba7:Ali15101996ohiba@sabo.x3bbofa.mongodb.net/?appName=SABO";

function generateWalletNumber() {
    // Generate valid 10-digit number starting with 1
    // e.g. 1xxxxxxxxx
    return '1' + Math.floor(100000000 + Math.random() * 900000000).toString();
}

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const customers = await Customer.find({
            $or: [
                { walletNumber: { $exists: false } },
                { walletNumber: null }
            ]
        });

        console.log(`Found ${customers.length} customers without wallet numbers.`);

        for (const customer of customers) {
            let walletNum = generateWalletNumber();

            // Ensure uniqueness (simple check, though collision is rare)
            let exists = await Customer.findOne({ walletNumber: walletNum });
            while (exists) {
                walletNum = generateWalletNumber();
                exists = await Customer.findOne({ walletNumber: walletNum });
            }

            customer.walletNumber = walletNum;
            await customer.save();
            console.log(`Updated customer ${customer.name} (${customer.phone}) with wallet: ${walletNum}`);
        }

        console.log("Migration complete.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
