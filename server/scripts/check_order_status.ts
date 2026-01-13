
import { connectMongoDB } from "../mongodb";
import { Order } from "../schemas";
import mongoose from "mongoose";

async function main() {
    await connectMongoDB();

    const orderIds = ["695bf79fe876b411af8b36be", "695bf4d7699f474b4d90ba84"];

    for (const id of orderIds) {
        if (mongoose.Types.ObjectId.isValid(id)) {
            const order = await Order.findById(id);
            if (order) {
                console.log(`Order ${id}: Status=${order.status}, PaymentStatus=${order.paymentStatus}, isPaid=${(order as any).isPaid}`);
            } else {
                console.log(`Order ${id} not found.`);
            }
        } else {
            // Try looking up by orderNumber just in case, though the logs suggest these are ObjectIds or huge numbers
            // Actually 695bf... looks like a mongo object id (12 bytes hex = 24 chars).
            // wait, 695bf79fe876b411af8b36be is 24 chars.
            const order = await Order.findById(id);
            if (order) {
                console.log(`Order ${id}: Status=${order.status}, PaymentStatus=${order.paymentStatus}, isPaid=${(order as any).isPaid}`);
            } else {
                console.log(`Order ${id} not found as ObjectId.`);
            }
        }
    }

    process.exit(0);
}

main().catch(console.error);
