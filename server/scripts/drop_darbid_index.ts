import { connectMongoDB, disconnectMongoDB } from '../mongodb';
import { City } from '../schemas-extended';

async function dropIndex() {
    try {
        console.log("Connecting to MongoDB...");
        await connectMongoDB();

        console.log("Dropping darbId unique index...");
        try {
            await City.collection.dropIndex('darbId_1');
            console.log("✅ Index dropped successfully");
        } catch (e: any) {
            if (e.code === 27 || e.message.includes('index not found')) {
                console.log("ℹ️  Index doesn't exist (already dropped or never created)");
            } else {
                throw e;
            }
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await disconnectMongoDB();
        process.exit(0);
    }
}

dropIndex();
