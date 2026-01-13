
import { getDb } from "../server/db";
import { categories, products, adminUsers } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
    console.log("Seeding database...");
    const db = await getDb();
    if (!db) {
        console.error("Failed to connect to database");
        process.exit(1);
    }

    // 1. Create Admin User
    console.log("Creating admin user...");
    const adminExists = await db.select().from(adminUsers).where(eq(adminUsers.username, "admin")).limit(1);
    if (adminExists.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash("admin123", salt);
        await db.insert(adminUsers).values({
            username: "admin",
            passwordHash: hash,
            isActive: true
        });
        console.log("Admin user created.");
    } else {
        console.log("Admin user already exists.");
    }

    // 2. Create Categories
    console.log("Creating categories...");
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length === 0) {
        const result = await db.insert(categories).values([
            { name: "Electronics", description: "Gadgets and devices", image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=500&auto=format&fit=crop&q=60" },
            { name: "Clothing", description: "Men and Women fashion", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60" },
            { name: "Home & Garden", description: "Decor and tools", image: "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=500&auto=format&fit=crop&q=60" }
        ]).returning();
        console.log(`Created ${result.length} categories.`);

        // 3. Create Products
        console.log("Creating products...");
        const electronicsId = result.find(c => c.name === "Electronics")?.id;
        const clothingId = result.find(c => c.name === "Clothing")?.id;

        if (electronicsId) {
            await db.insert(products).values([
                {
                    name: "Smartphone X",
                    description: "Latest model smartphone with high res camera",
                    categoryId: electronicsId,
                    price: 999.99,
                    stock: 50,
                    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60"
                },
                {
                    name: "Laptop Pro",
                    description: "Powerful laptop for professionals",
                    categoryId: electronicsId,
                    price: 1499.99,
                    stock: 20,
                    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60"
                }
            ]);
        }

        if (clothingId) {
            await db.insert(products).values([
                {
                    name: "Cotton T-Shirt",
                    description: "Comfortable cotton t-shirt",
                    categoryId: clothingId,
                    price: 19.99,
                    stock: 100,
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60"
                }
            ]);
        }
        console.log("Products created.");

    } else {
        console.log("Categories already exist, skipping product creation.");
    }

    console.log("Seeding complete!");
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
