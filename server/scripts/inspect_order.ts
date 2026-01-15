
import mongoose from 'mongoose';
import { Order, Customer } from '../schemas';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://aliohiba7:Ali15101996ohiba@sabo.x3bbofa.mongodb.net/?appName=SABO";

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        const orderNumber = "ORD-1767607065394";
        const order = await Order.findOne({ orderNumber });
        let customer;
        if (order && order.userId) {
            customer = await Customer.findById(order.userId);
        }

        const log = {
            found: !!order,
            orderNumber: order?.orderNumber,
            total: order?.totalAmount,
            shipping: (order as any)?.shippingCost,
            paymentDetails: order?.paymentDetails,
            customerId: order?.userId,
            customerBalance: customer?.walletBalance
        };

        fs.writeFileSync('server/scripts/order_log.json', JSON.stringify(log, null, 2));
        console.log("Log written");

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
run();
