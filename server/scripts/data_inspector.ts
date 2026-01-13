
import { connectMongoDB } from "../mongodb";
import { CartItem, Order } from "../schemas";
import mongoose from "mongoose";

async function main() {
    await connectMongoDB();

    // 1. Check Cart Items
    console.log("--- CART ITEMS ---");
    const cartItems = await CartItem.find({});
    console.log(`Total Cart Items in DB: ${cartItems.length}`);
    cartItems.forEach(item => {
        console.log(`User: ${item.userId}, Product: ${item.productId}, Qty: ${item.quantity}`);
    });

    // 2. Check Specific User
    const targetUserId = "695ba889a689ca8136ccb2e4"; // Extracted from customer_...
    console.log(`\n--- Items for ${targetUserId} ---`);
    const userItems = await CartItem.find({ userId: new mongoose.Types.ObjectId(targetUserId) });
    console.log(`Count: ${userItems.length}`);

    // 3. Check Orders
    const orderIds = ["695bf79fe876b411af8b36be", "695bf4d7699f474b4d90ba84"];
    console.log("\n--- ORDERS CHECK ---");
    for (const id of orderIds) {
        if (mongoose.Types.ObjectId.isValid(id)) {
            const order = await Order.findById(id);
            if (order) {
                console.log(`Order ${id}: Status=${order.status}, PaymentStatus=${(order as any).paymentStatus}, isPaid=${(order as any).isPaid}, Awarded=${(order as any).cashbackAwarded}`);
                // Detailed check
                const isPaid = (order as any).paymentStatus === 'paid' || (order as any).isPaid === true;
                console.log(`   -> Logic check: isPaid=${isPaid}, isDelivered=${order.status === 'delivered'}`);
            } else {
                console.log(`Order ${id} NOT FOUND`);
            }
        }
    }

    process.exit(0);
}

main().catch(console.error);
