
import mongoose from 'mongoose';
import { Customer, WalletTransaction } from '../schemas';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/online_store";

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const target = "1443025804";
        const customer = await Customer.findOne({ walletNumber: target });

        if (!customer) {
            console.log("Customer not found.");
            return;
        }

        console.log(`Customer: ${customer.name}`);
        console.log(`Original Balance in DB: ${customer.walletBalance}`);
        console.log(`Type of Balance: ${typeof customer.walletBalance}`);

        const txs = await WalletTransaction.find({ customerId: customer._id });
        let calc = 0;
        for (const t of txs) {
            if (['deposit', 'admin_add', 'refund', 'cashback'].includes(t.type)) {
                calc += t.amount;
            } else {
                calc -= t.amount;
            }
        }
        console.log(`Calculated from History: ${calc}`);

        if (Math.abs(calc - (customer.walletBalance || 0)) > 0.001) {
            console.log("Difference found. Fixing...");
            customer.walletBalance = calc;
            const res = await customer.save();
            console.log("Fixed. Saved Balance:", res.walletBalance);
        } else {
            console.log("No difference found.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
run();
