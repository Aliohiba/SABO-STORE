
import mongoose from "mongoose";
import "dotenv/config";

async function testConnection() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("No MONGODB_URI found in .env");
        return;
    }

    console.log("Attempting to connect to:", uri.replace(/:([^:@]+)@/, ":****@"));

    try {
        await mongoose.connect(uri);
        console.log("✅ Connection successful!");

        // List collections to see if it's empty
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        await mongoose.disconnect();
    } catch (error) {
        console.error("❌ Connection failed:", error);
    }
}

testConnection();
