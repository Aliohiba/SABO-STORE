
import { connectMongoDB } from "../mongodb";
import { OrderItem, StoreSettings } from "../schemas";
import mongoose from "mongoose";

async function main() {
    await connectMongoDB();

    const settings = await StoreSettings.findOne();
    console.log("Min Products Count for Cashback:", settings?.walletSettings?.minProductsCountForCashback);

    const orderId = "695bbf5b21d9ff8dee9dbde2";
    const items = await OrderItem.find({ orderId: new mongoose.Types.ObjectId(orderId) });

    console.log(`Order ${orderId} has ${items.length} items.`);
    items.forEach(i => console.log(` - ${i.quantity} x ${i.productName}`));

    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    console.log(`Total Quantity: ${totalQty}`);

    process.exit(0);
}

main().catch(console.error);
