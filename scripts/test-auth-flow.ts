
import "dotenv/config";

// Mock JWT_SECRET if missing for test
if (!process.env.JWT_SECRET) {
    console.warn("⚠️ JWT_SECRET missing in env, using mock secret for test");
    process.env.JWT_SECRET = "mock-secret-for-testing-only-1234567890";
}

import { appRouter } from "../server/routers";
import * as db from "../server/db-mongo";
import { connectMongoDB } from "../server/mongodb";
import mongoose from "mongoose";

async function main() {
    console.log("🚀 Testing Customer Auth Flow...");

    await connectMongoDB();

    // Mock Context
    const mockRes = {
        cookie: (name: string, value: string, options: any) => {
            console.log(`🍪 Cookie Set: ${name}=${value.substring(0, 15)}...`);
        },
        clearCookie: (name: string) => {
            console.log(`🚫 Cookie Cleared: ${name}`);
        }
    } as any;

    const mockReq = {
        headers: {
            "user-agent": "test-script"
        }
    } as any;

    const ctx = {
        req: mockReq,
        res: mockRes,
        user: null
    };

    const caller = appRouter.createCaller(ctx);

    const testEmail = `test.user.${Date.now()}@example.com`;
    const testPassword = "password123";

    try {
        // 1. Signup
        console.log("\n1️⃣ Testing Signup...");
        const signupResult = await caller.auth.signup({
            name: "Test User",
            email: testEmail,
            password: testPassword,
            phone: "0912345678"
        });
        console.log("✅ Signup Successful:", signupResult.user.email);

        // 2. Login
        console.log("\n2️⃣ Testing Login...");
        const loginResult = await caller.auth.login({
            email: testEmail,
            password: testPassword
        });
        console.log("✅ Login Successful:", loginResult.user.email);

        // 3. Login with wrong password
        console.log("\n3️⃣ Testing Invalid Login...");
        try {
            await caller.auth.login({
                email: testEmail,
                password: "wrongpassword"
            });
            console.error("❌ Failed to catch invalid password");
        } catch (e) {
            console.log("✅ Correctly rejected invalid password");
        }

        // Cleanup
        console.log("\nCleaning up...");
        const user = await db.getUserByEmail(testEmail);
        if (user) {
            await mongoose.connection.collection('users').deleteOne({ _id: user._id });
            console.log("✅ Test user deleted");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
