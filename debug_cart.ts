
import mongoose from "mongoose";
import { connectMongoDB } from "./server/mongodb";
import { User, Product, CartItem } from "./server/schemas";
import * as db from "./server/db-mongo";

async function debugCart() {
    await connectMongoDB();

    // 1. Get or create a dummy user
    let user = await User.findOne({ email: "debug@test.com" });
    if (!user) {
        user = await User.create({
            openId: "debug_user",
            name: "Debug User",
            email: "debug@test.com",
            role: "user",
        });
    }

    // 2. Get a product
    const product = await Product.findOne();
    if (!product) {
        console.log("No products found, cannot test cart.");
        process.exit(1);
    }

    // 3. Add to cart
    console.log("Adding product to cart:", product._id);
    await db.addCartItem(String(user._id), String(product._id), 1);

    // 4. Get cart items
    const items = await db.getCartItems(String(user._id));
    console.log("Cart Items retrieved:", JSON.stringify(items, null, 2));

    if (items.length > 0) {
        const item = items[0];
        console.log("First Item _id:", item._id);
        console.log("First Item id:", item.id);
        console.log("Type of _id:", typeof item._id);

        // 5. Try removing
        console.log("Removing item with ID:", String(item._id));
        await db.removeCartItem(String(item._id));

        const itemsAfter = await db.getCartItems(String(user._id));
        console.log("Cart Items after removal:", itemsAfter.length);
    }

    process.exit(0);
}

debugCart().catch(err => console.error(err));
