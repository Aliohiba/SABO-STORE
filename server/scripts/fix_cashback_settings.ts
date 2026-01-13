
import { connectMongoDB } from "../mongodb";
import { StoreSettings, Order, OrderItem, Customer, WalletTransaction } from "../schemas";
import mongoose from "mongoose";

async function main() {
    await connectMongoDB();

    // 1. Update Settings
    console.log("Updating minProductsCountForCashback to 0...");
    await StoreSettings.updateOne({}, { $set: { "walletSettings.minProductsCountForCashback": 0 } });

    // 2. Reprocess Order 695bbf5b21d9ff8dee9dbde2
    const orderId = "695bbf5b21d9ff8dee9dbde2";
    const fullOrder = await Order.findById(orderId);
    const settingsDoc = await StoreSettings.findOne();
    const settings = settingsDoc?.toObject() as any;

    if (fullOrder && !fullOrder.cashbackAwarded && fullOrder.status === 'delivered') {
        console.log("Reprocessing cashback for order:", fullOrder.orderNumber);

        const minOrderValue = settings.walletSettings.minOrderValueForCashback || 0;
        const minProductsCount = 0; // We just set it
        const cashbackPercentage = settings.walletSettings.cashbackPercentage || 0;

        const orderItems = await OrderItem.find({ orderId: fullOrder._id });
        const productsCount = orderItems.reduce((acc: any, item: any) => acc + (item.quantity || 1), 0);
        const baseAmount = fullOrder.totalAmount;

        console.log(`Stats: Count=${productsCount}, Amount=${baseAmount}, %=${cashbackPercentage}`);

        if (baseAmount >= minOrderValue && productsCount >= minProductsCount && cashbackPercentage > 0) {
            const cashbackAmount = (baseAmount * cashbackPercentage) / 100;
            console.log(`Awarding: ${cashbackAmount} LYD`);

            const customer = await Customer.findById(fullOrder.userId);
            if (customer) {
                const balanceBefore = customer.walletBalance || 0;
                const balanceAfter = balanceBefore + cashbackAmount;

                customer.walletBalance = balanceAfter;
                await customer.save();

                await WalletTransaction.create({
                    customerId: customer._id,
                    type: "cashback",
                    amount: cashbackAmount,
                    balanceBefore,
                    balanceAfter,
                    description: `كاش باك للطلب #${fullOrder.orderNumber}`,
                    referenceId: fullOrder.orderNumber,
                    status: "completed"
                });

                fullOrder.cashbackAwarded = true;
                await fullOrder.save();
                console.log("SUCCESS: Cashback awarded.");
            } else {
                console.error("Customer not found");
            }
        }
    } else {
        console.log("Order not eligible for re-processing or already awarded.");
    }

    process.exit(0);
}

main().catch(console.error);
