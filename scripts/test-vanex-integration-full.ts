
import { appRouter } from "../server/routers";
import * as db from "../server/db-mongo";
import { connectMongoDB } from "../server/mongodb";
import mongoose from "mongoose";

async function main() {
    console.log("🚀 Testing Full Vanex Integration Flow...");

    await connectMongoDB();

    // Mock Context
    const ctx = {
        req: {} as any,
        res: {} as any,
        user: { id: "admin_id", role: "admin", name: "Admin", openId: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } as any
    };

    const caller = appRouter.createCaller(ctx);

    const orderNumber = `TEST-${Date.now()}`;
    let orderId: string;

    try {
        // 1. Create a pending order manually (simulating user purchase)
        console.log("\n1️⃣ Creating Test Order...");
        const newOrder = await db.createOrder({
            orderNumber,
            customerName: "Integration Test User",
            customerEmail: "test@example.com",
            customerPhone: "0911234567",
            customerAddress: "Tripoli, Integration Street",
            cityId: 44, // Tripoli (ensure this ID is valid or mapped)
            totalAmount: 150.00,
            status: "pending",
            items: [] // Simplified
        } as any); // Using "any" to bypass strict checks for this test if types mismatch

        // Fix: db.createOrder in original code might return insertedId directly or the doc.
        // Let's assume it returns the doc or we fetch it.
        const createdOrder = await db.getOrderByNumber(orderNumber);
        if (!createdOrder) throw new Error("Order creation failed");
        orderId = String(createdOrder._id);
        console.log(`✅ Order Created: ${orderId} (${orderNumber})`);

        // 2. Admin confirms order -> Triggers Vanex
        console.log("\n2️⃣ Updating Status to 'confirmed' (Triggering Vanex)...");
        await caller.orders.updateStatus({
            id: orderId,
            status: "confirmed"
        });
        console.log("✅ Status Updated");

        // 3. Verify Tracking Code in DB
        console.log("\n3️⃣ Verifying DB Update...");
        const updatedOrder = await db.getOrderById(orderId);
        if (updatedOrder && updatedOrder.trackingCode) {
            console.log(`✅ Tracking Code Saved: ${updatedOrder.trackingCode}`);
            console.log(`✅ Vanex Order ID: ${updatedOrder.vanexOrderId}`);
        } else {
            console.error("❌ Tracking Code NOT saved to DB!");
            console.log("Order Data:", JSON.stringify(updatedOrder, null, 2));
        }

        // 4. Test Tracking API
        if (updatedOrder?.trackingCode) {
            console.log("\n4️⃣ Testing Tracking API with saved code...");
            const trackingResult = await caller.vanex.track({ code: updatedOrder.trackingCode });
            console.log("✅ Tracking API Result:", trackingResult.data.status);
        }

        // Cleanup
        console.log("\nCleaning up...");
        await mongoose.connection.collection('orders').deleteOne({ _id: updatedOrder?._id });
        console.log("✅ Test order deleted");

    } catch (error) {
        console.error("❌ Test Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
