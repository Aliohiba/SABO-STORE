
import { VanexService } from "../server/services/vanex";

async function main() {
    console.log("🚀 Testing Vanex Tracking...");

    // Tracking code from previous successful order or provided example
    const trackingCode = "-21128-VNX-6594243"; // From previous test output

    try {
        console.log(`Searching for tracking code: ${trackingCode}`);
        const result = await VanexService.getTracking(trackingCode);
        console.log("✅ Tracking Result:", JSON.stringify(result, null, 2));

        if (result && result.data && result.data.status) {
            console.log(`📦 Status: ${result.data.status}`);
        }

    } catch (error: any) {
        console.error("❌ Tracking Failed:", error.message);
        if (error.response) {
            console.error("Response:", error.response.data);
        }
    }
}

main();
