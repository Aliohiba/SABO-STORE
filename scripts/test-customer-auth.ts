
import { initMongo } from "../server/db-mongo";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { customerRouter } from "../server/routers/customer";
import { sdk } from "../server/_core/sdk";

// Mock Request/Response objects
const mockReq = (cookieHeader?: string) => ({
    headers: {
        cookie: cookieHeader || "",
    },
} as any);

const mockRes = () => {
    const cookies: Record<string, any> = {};
    return {
        cookie: (name: string, val: string, options: any) => {
            console.log(`[MockRes] Set Cookie: ${name}=${val?.substring(0, 15)}... Options:`, options);
            cookies[name] = val;
        },
        clearCookie: (name: string) => {
            console.log(`[MockRes] Clear Cookie: ${name}`);
            delete cookies[name];
        },
        _getCookies: () => cookies,
    } as any;
};

async function testAuthFlow() {
    console.log("🚀 Starting Auth Flow Test...");
    await initMongo();

    // 1. Login
    const res = mockRes();
    const ctx = await createContext({ req: mockReq(), res });
    const caller = appRouter.createCaller(ctx);

    console.log("\n1️⃣  Attempting Login...");
    try {
        const loginResult = await caller.customer.login({
            identifier: "0919473611",
            password: "password123" // Assuming this is set, otherwise might fail
        });
        console.log("✅ Login Successful:", loginResult.customer.name);
    } catch (error) {
        console.log("❌ Login Failed:", (error as Error).message);
        // If password failed, let's try to reset it first to ensure test continuity? 
        // No, let's just see.
        return;
    }

    // 2. Extract Cookie
    const cookies = res._getCookies();
    const sessionToken = cookies["session_token"]; // Check COOKIE_NAME constant
    if (!sessionToken) {
        console.error("❌ NO SESSION COOKIE SET!");
        return;
    }
    console.log("✅ Cookie Obtained");

    // 3. Verify Session via SDK directly
    console.log("\n2️⃣  Verifying Session Token via SDK...");
    const session = await sdk.verifySession(sessionToken);
    console.log("Session Payload:", session);

    if (!session || !session.openId.startsWith("customer_")) {
        console.error("❌ Session invalid or wrong type");
    } else {
        console.log("✅ Session Valid & Type is Customer");
    }

    // 4. Test Authenticated Request (Simulating 'me' endpoint)
    console.log("\n3️⃣  Testing 'me' endpoint with cookie...");
    const authReq = mockReq(`session_token=${sessionToken}`);
    const authCtx = await createContext({ req: authReq, res: mockRes() });

    if (authCtx.user) {
        console.log("✅ Context User Found:", authCtx.user);
        if (authCtx.user.role === 'customer') {
            console.log("🎉 SUCCESS: User identified as Customer!");
        } else {
            console.log("⚠️ WARNING: User role is:", authCtx.user.role);
        }
    } else {
        console.error("❌ Context User is NULL - authenticateRequest failed to identify user from cookie.");
    }

    process.exit(0);
}

testAuthFlow().catch(console.error);
