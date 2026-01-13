
import { connectMongoDB } from "../mongodb";
import { Order, OrderItem, StoreSettings, Customer, WalletTransaction } from "../schemas";
import mongoose from "mongoose";

// Duplicate logic for testing
const processCashback = async (orderId: string) => {
    console.log(`🔎 Checking Cashback eligibility for Order ${orderId}`);
    try {
        const settingsDoc = await StoreSettings.findOne();
        const settings = settingsDoc ? settingsDoc.toObject() as any : null;

        if (settings?.walletSettings?.cashbackEnabled) {
            let fullOrder = await Order.findById(orderId);

            if (fullOrder) {
                // Check if Delivered AND Paid
                const isPaid = (fullOrder as any).paymentStatus === 'paid' || (fullOrder as any).isPaid === true;

                if (fullOrder.status === 'delivered' && isPaid) {
                    console.log(`📋 Order details: User=${fullOrder.userId}, Total=${fullOrder.totalAmount}, Awarded=${fullOrder.cashbackAwarded}`);

                    if (fullOrder.userId && !fullOrder.cashbackAwarded) {
                        const minOrderValue = settings.walletSettings.minOrderValueForCashback || 0;
                        const minProductsCount = settings.walletSettings.minProductsCountForCashback || 0;
                        const cashbackPercentage = settings.walletSettings.cashbackPercentage || 0;

                        // Calculate product count
                        const orderItems = await OrderItem.find({ orderId: fullOrder._id });
                        const productsCount = orderItems.reduce((acc: any, item: any) => acc + (item.quantity || 1), 0);

                        const baseAmount = fullOrder.totalAmount;

                        console.log(`📊 Cashback Check: 
                - Products Count: ${productsCount} (Min: ${minProductsCount})
                - Amount: ${baseAmount} (Min: ${minOrderValue})
                - Percentage: ${cashbackPercentage}%`);

                        if (baseAmount >= minOrderValue && productsCount >= minProductsCount && cashbackPercentage > 0) {
                            console.log(`✅ Eligible! (Simulation)`);
                            // Don't actually award in this test script unless we want to fix it now
                            // But showing eligibility is enough debugging
                        } else {
                            console.log("⚠️ Cashback conditions not met.");
                        }
                    } else {
                        console.log(`⚠️ Order not eligible (No User ID or Already Awarded). UserId=${fullOrder.userId}, Awarded=${fullOrder.cashbackAwarded}`);
                    }
                } else {
                    console.log(`ℹ️ Order not eligible. Status=${fullOrder.status}, isPaid=${isPaid}`);
                }
            } else {
                console.log("Order not found");
            }
        } else {
            console.log("Cashback disabled");
        }
    } catch (err) {
        console.error(err);
    }
};

async function main() {
    await connectMongoDB();
    // The delivered, paid, unawarded order from log
    await processCashback("695bbf5b21d9ff8dee9dbde2");
    process.exit(0);
}

main().catch(console.error);
