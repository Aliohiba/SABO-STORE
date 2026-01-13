import axios from 'axios';

const LOGIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IkFsaU9oaWJhIiwiZm5hbWUiOiJBbGkiLCJsbmFtZSI6IlNBQk8gU1RPUkUiLCJ0YWdzIjpbXX0sInR5cGUiOiJBdXRob3JpemF0aW9uIiwiYWxsb3dlZElwcyI6WyI0MS4yNTQuNzUuKiJdLCJtb2RlIjoibGl2ZSIsInZlcnNpb24iOjIsImlkIjo1MzU1NzI5MzQ5MDgyODE3LCJpYXQiOjE3NjczOTA2ODUsImV4cCI6MTc2NzQ3NzA4NX0.K_GI1lvx0rfsaP69AlNHtTVbQXwP6aA-tlyxh5GGnPo";
const BASE_URL = "https://api.sabil.ly";
const BRANCH_NAME = "فرع زناتة";

async function testCreateOrder() {
    console.log("🧪 Testing Darb Sabil Order Creation...\n");

    const encodedBranchName = encodeURIComponent(BRANCH_NAME);
    const params = new URLSearchParams();

    // Required fields
    params.append('servicePackageId', 'tosyl-rgaly');
    params.append('title', 'Test Order from SABO Store');
    params.append('pickFromDoor', 'true');
    params.append('dropToDoor', 'false');

    // From location
    params.append('destination[from][city]', 'Tripoli');
    params.append('destination[from][address]', 'Store Address');

    // To location
    params.append('destination[to][city]', '1');
    params.append('destination[to][address]', 'Test Address, Tripoli');

    // Product
    params.append('products[0][sku]', `TEST-${Date.now()}`);
    params.append('products[0][title]', 'Test Product');
    params.append('products[0][amount]', '100');

    // Receiver
    params.append('receivers[0][fullName]', 'Test Customer');
    params.append('receivers[0][contact]', '0919473611');

    console.log("📦 Order Data:");
    console.log(params.toString());
    console.log("\n");

    try {
        const response = await axios({
            method: "POST",
            url: `${BASE_URL}/v1/orders/${encodedBranchName}/?autoGenerateRef=true`,
            headers: {
                "Authorization": `Bearer ${LOGIN_TOKEN}`,
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            },
            data: params.toString(),
            timeout: 10000
        });

        console.log("✅ SUCCESS! Order created successfully!");
        console.log("\n📋 Response:");
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.data && response.data.data.reference) {
            console.log("\n🎉 Order Reference:", response.data.data.reference);
        }

    } catch (error) {
        console.log("❌ FAILED!");
        console.log("Status:", error.response?.status);
        console.log("\n📋 Error Response:");
        console.log(JSON.stringify(error.response?.data, null, 2));

        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log("\n⚠️  Authentication issue - Token might be expired or invalid");
        }
    }
}

testCreateOrder();
