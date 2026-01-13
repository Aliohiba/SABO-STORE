
import { initMongo } from "../server/db-mongo";
import { AdminUser } from "../server/schemas";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

async function setAdminPassword() {
    try {
        await initMongo();
        console.log("Connected to MongoDB.");

        const admin = await AdminUser.findOne({ username: "admin" });

        if (admin) {
            const hash = await bcrypt.hash("password123", 10);
            admin.passwordHash = hash;
            await admin.save();
            console.log("✅ Admin password updated to: password123");
        } else {
            console.log("⚠️ Admin user not found. Creating new admin...");
            const hash = await bcrypt.hash("password123", 10);
            await AdminUser.create({
                username: "admin",
                passwordHash: hash,
                role: "super_admin",
                permissions: ["all"]
            });
            console.log("✅ Admin user created with password: password123");
        }

    } catch (error) {
        console.error("Error updating password:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

setAdminPassword();
