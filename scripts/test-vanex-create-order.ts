
import dotenv from 'dotenv';
dotenv.config();

import { connectMongoDB, disconnectMongoDB } from '../server/mongodb';
import { VanexService } from '../server/services/vanex';
import { updateVanexSetting } from '../server/db-mongo-extended';

async function main() {
    try {
        console.log("Connecting to MongoDB...");
        await connectMongoDB();

        console.log("Setting up Vanex configuration...");
        await updateVanexSetting({
            costOnAccount: 'customer',
            additionalCostOnAccount: 'customer',
            commissionOnAccount: 'customer',
            isFragile: false,
            allowInspection: false,
            needsSafePackaging: false,
        });

        console.log("Creating Test Order...");
        const orderData = {
            customerName: "Test Customer " + Date.now(),
            customerPhone: "0911234567",
            cityId: 42, // Tripoli (Valid ID from user data)
            address: "Tripoli, Near Martyrs Square",
            totalPrice: 150.00,
            note: "Test Order Default"
        };

        console.log("Input Data:", orderData);

        const result = await VanexService.createOrder(orderData);
        console.log("\n✅ Order Created Successfully!");
        console.log("Response:", JSON.stringify(result, null, 2));

    } catch (error: any) {
        console.error("\n❌ Error creating order:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("API Response:", JSON.stringify(error.response.data, null, 2));
        } else if (error.cause) {
            console.error("Cause:", error.cause);
        }
    } finally {
        await disconnectMongoDB();
        process.exit(0);
    }
}

main();
