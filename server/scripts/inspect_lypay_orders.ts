
import { connectMongoDB } from "../mongodb";
import { Order, StoreSettings } from "../schemas";
import mongoose from "mongoose";
import fs from "fs";

async function main() {
    await connectMongoDB();
    let log = "";
    const logLine = (str: string) => { console.log(str); log += str + "\n"; };

    logLine("--- Store Settings ---");
    const settings = await StoreSettings.findOne();
    if (settings) {
        logLine(`Cashback Enabled: ${settings.walletSettings?.cashbackEnabled}`);
        logLine(`Cashback %: ${settings.walletSettings?.cashbackPercentage}`);
        logLine(`Min Order Value: ${settings.walletSettings?.minOrderValueForCashback}`);
    } else {
        logLine("No StoreSettings found.");
    }

    logLine("\n--- LYPAY Orders ---");
    const orders = await Order.find({ paymentMethod: 'lypay' }).sort({ createdAt: -1 }).limit(10).lean();

    if (orders.length === 0) {
        logLine("No LYPAY orders found.");
    }

    for (const order of orders) {
        logLine(`\nOrder: ${order.orderNumber} (ID: ${order._id})`);
        logLine(`Status: ${order.status}`);
        logLine(`isPaid: ${order.isPaid} (Type: ${typeof order.isPaid})`);
        logLine(`PaymentMethod: ${order.paymentMethod}`);
        logLine(`CashbackAwarded: ${order.cashbackAwarded}`);
        logLine(`UserId: ${order.userId}`);

        const isPaid = (order as any).paymentStatus === 'paid' || order.isPaid === true;
        logLine(`Logic Check -> isDelivered: ${order.status === 'delivered'}, isPaid: ${isPaid}`);
    }

    fs.writeFileSync("lypay_log_utf8.txt", log, "utf-8");
    process.exit(0);
}

main().catch(console.error);
