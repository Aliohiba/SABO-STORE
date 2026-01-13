
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { AdminUser, Category, Product } from "../server/schemas";
import { connectMongoDB, disconnectMongoDB } from "../server/mongodb";
import "dotenv/config";

async function main() {
    console.log("Seeding MongoDB...");

    try {
        await connectMongoDB();

        // 1. Create Admin User
        console.log("Creating admin user...");
        const existingAdmin = await AdminUser.findOne({ username: "admin" });
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash("admin123", salt);
            await AdminUser.create({
                username: "admin",
                passwordHash,
                isActive: true,
                email: "admin@example.com",
                name: "Administrator"
            });
            console.log("Admin user created.");
        } else {
            console.log("Admin user already exists.");
        }

        // 2. Create Categories
        console.log("Creating categories...");
        const categoriesData = [
            { name: "Electronics", description: "Gadgets and devices", image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=500&auto=format&fit=crop&q=60" },
            { name: "Clothing", description: "Men and Women fashion", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60" },
            { name: "Home & Garden", description: "Decor and tools", image: "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=500&auto=format&fit=crop&q=60" }
        ];

        const createdCategories = [];
        for (const catData of categoriesData) {
            let category = await Category.findOne({ name: catData.name });
            if (!category) {
                category = await Category.create(catData);
                console.log(`Category ${catData.name} created.`);
            }
            createdCategories.push(category);
        }

        // 3. Create Products
        console.log("Creating products...");
        const electronics = createdCategories.find(c => c.name === "Electronics");
        const clothing = createdCategories.find(c => c.name === "Clothing");

        if (electronics) {
            const p1 = await Product.findOne({ name: "Smartphone X" });
            if (!p1) {
                await Product.create({
                    name: "Smartphone X",
                    description: "Latest model smartphone with high res camera",
                    categoryId: electronics._id,
                    price: 999.99,
                    stock: 50,
                    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60",
                    status: "available"
                });
            }

            const p2 = await Product.findOne({ name: "Laptop Pro" });
            if (!p2) {
                await Product.create({
                    name: "Laptop Pro",
                    description: "Powerful laptop for professionals",
                    categoryId: electronics._id,
                    price: 1499.99,
                    stock: 20,
                    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                    status: "available"
                });
            }
        }

        if (clothing) {
            const p3 = await Product.findOne({ name: "Cotton T-Shirt" });
            if (!p3) {
                await Product.create({
                    name: "Cotton T-Shirt",
                    description: "Comfortable cotton t-shirt",
                    categoryId: clothing._id,
                    price: 19.99,
                    stock: 100,
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60",
                    status: "available"
                });
            }
        }
        console.log("Products seeded.");

        await disconnectMongoDB();
        console.log("Seeding complete!");
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

main();
