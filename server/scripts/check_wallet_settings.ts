
import mongoose from 'mongoose';
import { StoreSettings } from '../schemas';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://aliohiba7:Ali15101996ohiba@sabo.x3bbofa.mongodb.net/?appName=SABO";

async function checkSettings() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const settings = await StoreSettings.findOne();
    if (settings) {
        console.log("Wallet Settings:");
        console.log(JSON.stringify(settings.walletSettings, null, 2));
    } else {
        console.log("No settings found");
    }

    await mongoose.disconnect();
}

checkSettings();
