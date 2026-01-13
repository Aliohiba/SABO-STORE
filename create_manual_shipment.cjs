const axios = require('axios');

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NWNlODExZDcwNGI5ZGY2MGI0MTY3MCIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImF1ZCI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2NzY5NjQwMX0.Mty8iFDSs7zdsx7JVWJWyDt-lu1uy1k-CCSoJRMiZx8";
const ACCOUNT_ID = "67a4cf7a59bfb31e4a6560cb";
const BASE_URL = "https://v2.sabil.ly";

// Service ID retrieved from verification script or known constant
// Usually needs to be correct for shipment creation.
// If 6783c612dcf305c9e775c987 fails with 500, we might need another one.
// Let's rely on the one in darb_sabil.ts first.
const SERVICE_ID = "6783c612dcf305c9e775c987";

async function createTestShipment() {
    console.log("🚀 Creating Test Shipment for 'Ali'...");

    // Normalize Phone
    const phone = "+218919473611";

    const headers = {
        "Authorization": `apikey ${API_KEY}`,
        "X-ACCOUNT-ID": ACCOUNT_ID,
        "X-API-VERSION": "1.0.0",
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    try {
        // 1. Create Contact
        console.log("1️⃣ Creating Contact...");
        const contactPayload = { name: "علي", phone: phone };

        let contactId;
        try {
            const contactRes = await axios.post(`${BASE_URL}/api/contacts`, contactPayload, { headers });
            contactId = contactRes.data?.data?._id || contactRes.data?.id || contactRes.data?._id;
            console.log(`✅ Contact Created/Found: ${contactId}`);
        } catch (err) {
            console.log(`⚠️ Contact creation failed, trying to find existing...`);
            // Fallback search
            const searchRes = await axios.get(`${BASE_URL}/api/contacts?search=${phone.replace('+', '')}`, { headers });
            const found = (searchRes.data?.data || []).find(c => c.phone.includes("919473611"));
            if (found) {
                contactId = found._id;
                console.log(`✅ Found Existing Contact: ${contactId}`);
            } else {
                throw new Error("Could not create or find contact");
            }
        }

        // 2. Create Shipment
        console.log("2️⃣ Creating Shipment...");
        const shipmentPayload = {
            service: SERVICE_ID,
            contacts: [contactId],
            paymentBy: "receiver",
            to: {
                countryCode: "lby",
                city: "طرابلس",
                area: "شارع النصر",
                address: "شارع النصر، طرابلس"
            },
            products: [
                {
                    title: "Test Order - Ali",
                    amount: 50, // Example Amount
                    quantity: 1,
                    isChargeable: true,
                    currency: "lyd"
                }
            ],
            notes: "تجربة إنشاء شحنة يدوية"
        };

        const shipmentRes = await axios.post(`${BASE_URL}/api/local/shipments`, shipmentPayload, { headers });
        console.log(`✅✅ Shipment Created Successfully!`);
        console.log("Response:", JSON.stringify(shipmentRes.data, null, 2));

    } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        if (err.response) {
            console.log("Status:", err.response.status);
            console.log("Data:", JSON.stringify(err.response.data, null, 2));
        }
    }
}

createTestShipment();
