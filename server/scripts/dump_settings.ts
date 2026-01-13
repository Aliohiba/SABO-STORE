
import { connectMongoDB } from "../mongodb";
import { StoreSettings } from "../schemas";
import mongoose from "mongoose";

async function main() {
    await connectMongoDB();
    const settings = await StoreSettings.findOne();
    if (settings && settings.walletSettings) {
        console.log(JSON.stringify(settings.walletSettings, null, 2));
    }
    process.exit(0);
}

main().catch(console.error);
