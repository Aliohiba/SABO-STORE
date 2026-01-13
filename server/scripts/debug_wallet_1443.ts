
import mongoose from 'mongoose';
import { Customer, WalletTransaction, Wallet } from '../schemas';
import dotenv from 'dotenv';
import path from 'path';

// Fix for env file if needed, but standard config should work if run from project root
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/online_store";

async function run() {
    try {
        console.log("Connecting to:", MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const target = "1443025804";
        console.log(`Checking for target: ${target}`);

        // 1. Find Customer
        let customer = await Customer.findOne({ walletNumber: target });
        let matchedBy = "";

        if (customer) {
            matchedBy = "walletNumber";
        } else {
            customer = await Customer.findOne({ phone: target });
            if (customer) matchedBy = "phone";
        }

        if (customer) {
            console.log(`[FOUND VIA ${matchedBy.toUpperCase()}]`);
            console.log("Customer Details:");
            console.log(`  ID: ${customer._id}`);
            console.log(`  Name: ${customer.name}`);
            console.log(`  Phone: ${customer.phone}`);
            console.log(`  WalletNumber: ${customer.walletNumber}`);
            console.log(`  WalletBalance (in Customer Doc): ${customer.walletBalance}`);

            // 2. Check Transactions
            const txs = await WalletTransaction.find({ customerId: customer._id }).sort({ createdAt: 1 });
            console.log(`\nTransactions (${txs.length}):`);

            let calcBalance = 0;
            for (const t of txs) {
                const amt = t.amount;
                let op = "";
                // Logic based on wallet.ts
                if (['deposit', 'admin_add', 'refund', 'cashback'].includes(t.type)) {
                    calcBalance += amt;
                    op = "+";
                } else {
                    calcBalance -= amt;
                    op = "-";
                }
                console.log(`  Tx: ${t._id} | ${t.type} ${op}${amt} | Calc: ${calcBalance} | Stored After: ${t.balanceAfter} | Status: ${t.status}`);
            }

            console.log(`\nFinal Calculated Balance from Transactions: ${calcBalance}`);
            console.log(`Customer.walletBalance: ${customer.walletBalance}`);

            // 3. Check Wallet Model (if exists)
            // 'userId' in Wallet schema usually refers to User or Customer? 
            // In wallet.ts: extractCustomerId(userId). It uses ObjectId.
            // But if Schema says 'ref: User', and we pass CustomerId...
            // Let's check with CustomerId
            const wallet = await Wallet.findOne({ userId: customer._id });
            if (wallet) {
                console.log(`\nWallet Model Found (userId=${customer._id}):`);
                console.log(`  Balance: ${wallet.balance}`);
            } else {
                console.log(`\nWallet Model NOT Found for userId ${customer._id}`);
            }

            // Mismatch Logic
            if (Math.abs(calcBalance - (customer.walletBalance || 0)) > 0.01) {
                console.log("\n!!! MISMATCH DETECTED (Transactions vs Customer.walletBalance) !!!");
                console.log("Updating Customer.walletBalance to match Transactions...");
                customer.walletBalance = calcBalance;
                await customer.save();
                console.log("Update Complete.");
            } else {
                console.log("\nBalances Match.");
            }

            // Sync Wallet Model if needed
            if (wallet && Math.abs(wallet.balance - (customer.walletBalance || 0)) > 0.01) {
                console.log("Updating Wallet Model to match Customer...");
                wallet.balance = customer.walletBalance;
                await wallet.save();
            }

        } else {
            console.log("Customer NOT FOUND by WalletNumber or Phone.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
