import mongoose from "mongoose";

let isConnected = false;

export async function connectMongoDB() {
  if (isConnected) {
    console.log("[MongoDB] Already connected");
    return;
  }
  //vhgvhvh
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/online_store";

    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: "majority",
    });

    isConnected = true;
    console.log("[MongoDB] ✅ Connected successfully to", mongoUri);
  } catch (error) {
    console.error("[MongoDB] ❌ Connection failed:", error);
    isConnected = false;
    throw error;
  }
}

export function getMongoConnection() {
  return mongoose.connection;
}

export async function disconnectMongoDB() {
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("[MongoDB] Disconnected");
  } catch (error) {
    console.error("[MongoDB] Disconnect error:", error);
  }
}
