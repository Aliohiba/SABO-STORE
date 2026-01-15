
import mongoose from "mongoose";
import "dotenv/config";
import {
    AdminUser, User, Customer, Category, Product, Order, OrderItem,
    CartItem, Wallet, WalletTransaction, SupportMessage
} from "../schemas";
import {
    ProductImage, ProductOption, City, Region, DeliveryCompany, Shipment,
    OrderTracking, VanexSetting, StoreSettings
} from "../schemas-extended";

const LOCAL_URI = "mongodb://localhost:27017/online_store";
const REMOTE_URI = process.env.MONGODB_URI;

async function migrate() {
    if (!REMOTE_URI || REMOTE_URI.includes("localhost")) {
        console.error("❌ Destination URI looks like local or is missing in .env");
        return;
    }

    console.log("🚀 Starting migration from Local to Atlas...");

    // 1. Fetch data from Local
    console.log("📥 Reading from Local Database...");
    await mongoose.connect(LOCAL_URI);

    const data: any = {};

    data.adminUsers = await AdminUser.find().lean();
    data.users = await User.find().lean();
    data.customers = await Customer.find().lean();
    data.categories = await Category.find().lean();
    data.products = await Product.find().lean();
    data.orders = await Order.find().lean();
    data.orderItems = await OrderItem.find().lean();
    data.cartItems = await CartItem.find().lean();
    data.wallets = await Wallet.find().lean();
    data.walletTransactions = await WalletTransaction.find().lean();
    data.supportMessages = await SupportMessage.find().lean();

    data.productImages = await ProductImage.find().lean();
    data.productOptions = await ProductOption.find().lean();
    data.cities = await City.find().lean();
    data.regions = await Region.find().lean();
    data.deliveryCompanies = await DeliveryCompany.find().lean();
    data.shipments = await Shipment.find().lean();
    data.orderTrackings = await OrderTracking.find().lean();
    data.vanexSettings = await VanexSetting.find().lean();
    data.storeSettings = await StoreSettings.find().lean();

    console.log(`✅ Fetched ${data.products.length} products, ${data.orders.length} orders, etc.`);

    await mongoose.disconnect();

    // 2. Upload to Remote
    console.log("📤 Connecting to Atlas to upload...");
    try {
        await mongoose.connect(REMOTE_URI);
        console.log("✅ Connected to Atlas!");

        // Helper to clear and insert
        const migrateCollection = async (model: any, docs: any[], name: string) => {
            if (docs.length === 0) return;
            console.log(`Processing ${name}: ${docs.length} docs...`);
            // Optional: Clear existing data? Or upsert?
            // For safety, let's just insert commands. If duplicates exist, it will throw.
            // Better strategy for migration: Delete all and re-insert is easiest for active migration.
            await model.deleteMany({});
            await model.insertMany(docs);
            console.log(`  Included ${docs.length} ${name}.`);
        };

        await migrateCollection(AdminUser, data.adminUsers, "AdminUsers");
        await migrateCollection(User, data.users, "Users");
        await migrateCollection(Customer, data.customers, "Customers");
        await migrateCollection(Category, data.categories, "Categories");
        await migrateCollection(Product, data.products, "Products");
        await migrateCollection(Order, data.orders, "Orders");
        await migrateCollection(OrderItem, data.orderItems, "OrderItems");
        await migrateCollection(CartItem, data.cartItems, "CartItems");
        await migrateCollection(Wallet, data.wallets, "Wallets");
        await migrateCollection(WalletTransaction, data.walletTransactions, "WalletTransactions");
        await migrateCollection(SupportMessage, data.supportMessages, "SupportMessages");

        await migrateCollection(ProductImage, data.productImages, "ProductImages");
        await migrateCollection(ProductOption, data.productOptions, "ProductOptions");
        await migrateCollection(City, data.cities, "Cities");
        await migrateCollection(Region, data.regions, "Regions");
        await migrateCollection(DeliveryCompany, data.deliveryCompanies, "DeliveryCompanies");
        await migrateCollection(Shipment, data.shipments, "Shipments");
        await migrateCollection(OrderTracking, data.orderTrackings, "OrderTrackings");
        await migrateCollection(VanexSetting, data.vanexSettings, "VanexSettings");
        await migrateCollection(StoreSettings, data.storeSettings, "StoreSettings");

        console.log("🎉 Migration Complete!");
    } catch (e) {
        console.error("❌ Error uploading to Atlas:", e);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
