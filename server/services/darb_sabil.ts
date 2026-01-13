import axios from "axios";
import { TRPCError } from "@trpc/server";

// V2 API Configuration
// Ideally these should be in process.env
const API_KEY = process.env.DARB_API_KEY || "eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NjIxYTg4NzczOGU4MTA1ZmE2MmY3NiIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImF1ZCI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2ODAzNzAwMH0.TvQVlYbX2hGUgYoQ4XzcP__55GsIy_DbKVbjdrtbu58";
const ACCOUNT_ID = process.env.DARB_ACCOUNT_ID || "67a4cf7a59bfb31e4a6560cb";
const BASE_URL = process.env.DARB_BASE_URL || "https://v2.sabil.ly";

export class DarbSabilService {
    private static async request(method: "GET" | "POST", endpoint: string, data?: any) {
        try {
            const config = {
                method,
                url: `${BASE_URL}${endpoint}`,
                headers: {
                    "Authorization": `apikey ${API_KEY}`,
                    "X-ACCOUNT-ID": ACCOUNT_ID,
                    "X-API-VERSION": "1.0.0",
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                data: data
            };

            console.log(`📡 Request: ${method} ${endpoint}`, data ? JSON.stringify(data, null, 2) : '');
            const response = await axios(config);
            console.log(`✅ Darb Sabil Response (${endpoint}):`, JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error: any) {
            console.error(`❌ Darb Sabil API Error: ${method} ${endpoint}`, error.response?.data || error.message);
            // Log full error for debugging
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Data:", JSON.stringify(error.response.data, null, 2));
            }
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Error communicating with Darb Al-Sabeel API",
                cause: error
            });
        }
    }

    // Hierarchical Data Structure for Cities and Areas/Nodes
    private static readonly CITY_AREAS: Record<string, Array<{ name: string, price: number }>> = {
        "طرابلس": [
            { name: "المدينة", price: 10 }, { name: "جنزور", price: 15 }, { name: "السياحية", price: 15 },
            { name: "طريق المشتل", price: 15 }, { name: "مشروع الهضبة", price: 15 }, { name: "الدعوة الإسلامية", price: 15 },
            { name: "تاجوراء", price: 15 }, { name: "البيفي", price: 15 }, { name: "صلاح الدين", price: 15 },
            { name: "عين زارة", price: 15 }, { name: "الهضبة البدري", price: 15 }, { name: "طريق الفلاح", price: 10 },
            { name: "الهضبة الخضراء", price: 15 }, { name: "طريق المطار", price: 15 }, { name: "قرقارش", price: 15 },
            { name: "بوابة الجبس", price: 15 }, { name: "الهضبة طول", price: 15 }, { name: "الكيزة", price: 15 },
            { name: "غوط الشعال", price: 15 }, { name: "السراج", price: 15 }, { name: "أربعة شوارع الجلدية", price: 15 },
            { name: "النجيلة", price: 20 }, { name: "السواني", price: 20 }, { name: "الكريمية", price: 20 },
            { name: "حي الأندلس", price: 10 }, { name: "قرجي", price: 10 }, { name: "ابوسليم", price: 10 },
            { name: "حي الاكواخ", price: 10 }, { name: "الفرناج", price: 10 }, { name: "زناتة", price: 10 },
            { name: "الظهرة", price: 10 }, { name: "شارع النصر", price: 10 }, { name: "رأس حسن", price: 10 },
            { name: "بن عاشور", price: 10 }, { name: "جرابة", price: 10 }, { name: "شارع الظل", price: 10 },
            { name: "الهاني", price: 10 }, { name: "عرادة", price: 10 },
            { name: "سوق الجمعة", price: 10 }, { name: "البطاطا", price: 10 }, { name: "حي دمشق", price: 10 },
            { name: "طريق الصور", price: 10 }, { name: "السيدي", price: 10 }, { name: "النوفليين", price: 10 },
            { name: "طريق الشوك", price: 10 }, { name: "السبعة", price: 10 }, { name: "وادي الربيع", price: 20 },
            { name: "الخلة", price: 20 }, { name: "سوق السبت", price: 20 },
            { name: "الغرارات", price: 10 }, { name: "معيتيقة", price: 10 }, { name: "طريق عشرين رمضان", price: 10 },
            { name: "فشلوم", price: 10 }, { name: "باب العزيزية", price: 10 }, { name: "باب عكارة", price: 10 },
            { name: "شارع الجمهورية", price: 10 }, { name: "المنصورة", price: 10 }, { name: "غرغور", price: 10 },
            { name: "الدريبي", price: 10 }, { name: "باب بن غشير", price: 10 }, { name: "العزيزية", price: 20 },
            { name: "الساعدية", price: 20 }, { name: "الزهراء", price: 20 }, { name: "سوق الخميس مسيحل", price: 20 },
            { name: "السبيعة", price: 20 }, { name: "الرياضية", price: 10 }, { name: "كشلاف", price: 10 },
            { name: "الباعيش", price: 20 }, { name: "زاوية الدهماني", price: 10 }, { name: "الحي الإسلامي", price: 10 },
            { name: "شارع الزاوية", price: 10 }, { name: "خلة فارس", price: 15 }, { name: "جنزور شعبية عبدالجليل", price: 10 },
            { name: "بئر التوتة", price: 20 }, { name: "السهلة", price: 15 }, { name: "تاجوراء بئير العالم", price: 15 },
            { name: "سيد السائح", price: 20 }, { name: "الهضبة الشرقية", price: 10 }, { name: "صياد", price: 15 },
            { name: "طريق المطار الرملة", price: 15 }, { name: "غوط الرمان", price: 20 }, { name: "الأحياء البرية", price: 15 },
            { name: "النشيع", price: 15 }, { name: "عمر المختار", price: 10 }
        ],
        "بنغازي": [
            { name: "بنغازي", price: 30 }, { name: "الرحبة", price: 30 }, { name: "توتكرة", price: 35 },
            { name: "الرجمة", price: 30 }, { name: "قمينس", price: 40 }, { name: "المقزحة", price: 30 },
            { name: "سلوق", price: 40 }
        ],
        "مصراتة": [
            { name: "مصراتة", price: 20 }, { name: "تاورغاء", price: 30 }, { name: "الدافنية", price: 20 }, // estimated
            { name: "بوقرين", price: 30 }
        ],
        "الزاوية": [
            { name: "الزاوية", price: 20 }, { name: "الماية", price: 30 }, { name: "المطرد", price: 25 },
            { name: "صرمان", price: 25 }, { name: "صبراتة", price: 25 }, { name: "العجيلات", price: 30 },
            { name: "الجميل", price: 30 }, { name: "رقدالين", price: 30 }, { name: "زلطن", price: 30 },
            { name: "أبي كماش", price: 40 }, { name: "رأس جدير", price: 40 }, { name: "زوارة", price: 25 },
            { name: "بوعيسى", price: 25 }, { name: "ورشفانة", price: 30 }
        ],
        "الخمس": [
            { name: "الخمس", price: 20 }, { name: "قصر خيار", price: 20 }, { name: "القره بولي", price: 20 },
            { name: "قماطة", price: 20 }, { name: "مسلاتة", price: 30 }, { name: "العرقوب", price: 30 },
            { name: "ام القنديل", price: 30 }
        ],
        "زليتن": [
            { name: "زليتن", price: 20 }
        ],
        "سرت": [
            { name: "سرت", price: 30 }, { name: "هراوة", price: 30 }, { name: "بن جواد", price: 30 },
            { name: "النوفلية", price: 30 }, { name: "ابو هادي", price: 30 }, { name: "بشر", price: 30 }
        ],
        "أجدابيا": [
            { name: "أجدابيا", price: 30 }, { name: "البريقة", price: 30 }, { name: "العقيلة", price: 30 },
            { name: "جالو اوجلة", price: 50 }, { name: "الزويتينة", price: 30 } // estimated
        ],
        "البيضاء": [
            { name: "البيضاء", price: 35 }, { name: "شحات", price: 40 }, { name: "مسة", price: 35 },
            { name: "قندولة", price: 35 }, { name: "مراوة", price: 35 }, { name: "اسلنطة", price: 35 },
            { name: "قصر ليبيا", price: 35 }, { name: "زاوية العرقوب", price: 35 }, { name: "الابرق", price: 40 }, // estimated
            { name: "سوسة", price: 40 }, { name: "الفايدية", price: 40 } // estimated
        ],
        "درنة": [
            { name: "درنة", price: 40 }, { name: "القبة", price: 40 }, { name: "مرتوبة", price: 40 },
            { name: "عين مارة", price: 40 }, { name: "ام الرزم", price: 40 }, { name: "التميمي", price: 40 },
            { name: "البمبه", price: 40 }, { name: "الوتر", price: 40 }, { name: "كروم الخيل", price: 40 }
        ],
        "طبرق": [
            { name: "طبرق", price: 40 }, { name: "باب الزيتون", price: 40 }, { name: "مساعد", price: 50 },
            { name: "كمبوت", price: 40 }, // estimated
            { name: "بئر الاشهب", price: 40 } // estimated
        ],
        "المرج": [
            { name: "المرج", price: 35 }, { name: "الأبيار", price: 35 }, { name: "البياضة", price: 35 },
            { name: "تاكنس", price: 35 }
        ],
        "سبها": [
            { name: "سبها", price: 35 }, { name: "براك الشاطي", price: 40 }, { name: "تراغن", price: 60 },
            { name: "القطرون", price: 60 }, { name: "مرزق", price: 60 }, { name: "اوباري", price: 50 },
            { name: "الغريفة", price: 50 }, { name: "تراغن", price: 60 }, { name: "أم الارانب", price: 45 },
            { name: "وادى عتبة", price: 60 }
        ],
        "الجفرة": [
            { name: "الجفرة", price: 35 }, { name: "هون", price: 35 }, { name: "ودان", price: 35 },
            { name: "سوكنة", price: 35 }, { name: "زلة", price: 45 }
        ],
        "غريان": [
            { name: "غريان", price: 30 }, { name: "الرابطة", price: 30 }, { name: "القواسم", price: 30 }, // estimated
            { name: "الاصابعة", price: 35 }
        ],
        "ترهونة": [
            { name: "ترهونة", price: 30 }
        ],
        "بني وليد": [
            { name: "بني وليد", price: 30 }
        ],
        "نالوت": [
            { name: "نالوت", price: 50 }, { name: "كاباو", price: 40 }, { name: "الحرابه", price: 40 },
            { name: "تيجي", price: 45 }, { name: "بدر الصيعان", price: 40 }, { name: "غدامس", price: 50 },
            { name: "درج", price: 40 }
        ],
        "الزنتان": [
            { name: "الزنتان", price: 35 }, { name: "يفرن", price: 35 }, { name: "الرياينة", price: 35 },
            { name: "الرجبان", price: 35 }, { name: "الرحيبات", price: 40 }, { name: "جادو", price: 40 },
            { name: "المشاشية", price: 35 }, { name: "الرقيعات", price: 40 }, { name: "طمزين", price: 40 },
            { name: "تندميرا", price: 40 }
        ],
        "الكفرة": [
            { name: "الكفرة", price: 50 }, { name: "تازربو", price: 50 }
        ],
        "غات": [
            { name: "غات", price: 60 }, { name: "العوينات", price: 60 }
        ],
        "قصر بن غاشير": [
            { name: "قصر بن غاشير", price: 20 }
        ],
        "مزدة": [
            { name: "مزدة", price: 35 }, { name: "الشويرف", price: 35 }, { name: "القريات", price: 35 }
        ]
    };

    static async getCities() {
        return Object.keys(this.CITY_AREAS).map(name => ({ id: name, name: name, price: 0 }));
    }

    static async getAreas(cityName: string) {
        return this.CITY_AREAS[cityName] || [];
    }

    static mapCityIdToName(id: any): string {
        const map: any = {
            1: "طرابلس", // Tripoli
            2: "بنغازي", // Benghazi
            3: "مصراتة", // Misrata
            4: "سبها",   // Sabha
            5: "زليتن",  // Zliten
            6: "الخمس",  // Khoms
            7: "غريان",  // Gharyan
            8: "طبرق",   // Tobruk
            9: "درنة",   // Derna
            10: "قصر بن غاشير" // Qasr Bin Ghashir
        };

        // If it's a number and exists in map, return the mapped name
        if (!isNaN(Number(id)) && map[id]) {
            return map[id];
        }

        // Otherwise return the ID itself as a string (assuming it's already the name)
        return String(id);
    }

    static async getServicePackages() {
        // Placeholder as endpoint /api/local/services returned 404
        // User needs to obtain specific Service IDs from their dashboard
        return [];
    }

    static getDefaultArea(city: string): string {
        const areaMap: Record<string, string> = {
            "طرابلس": "النجيلة",
            "بنغازي": "السلماني",
            "مصراتة": "وسط البلاد",
            "سبها": "الجديد",
            "زليتن": "وسط البلاد",
            "الخمس": "وسط البلاد",
            "غريان": "تغسات",
            "طبرق": "طبرق",
            "درنة": "وسط البلاد"
        };
        return areaMap[city] || city;
    }

    static async createOrder(orderData: any) {
        try {
            // 1. Create or Get Contact
            // 1. Create or Get Contact
            console.log("Creating/Fetching Contact for Customer:", orderData.customerName);

            // Robust Phone Normalization
            let rawPhone = String(orderData.customerPhone || "").trim();
            // Remove all non-numeric characters (except + at start)
            let cleanPhone = rawPhone.replace(/[^0-9+]/g, "");

            // Handle formats
            if (cleanPhone.startsWith("00")) {
                cleanPhone = "+" + cleanPhone.substring(2);
            } else if (cleanPhone.startsWith("0")) {
                cleanPhone = "+218" + cleanPhone.substring(1);
            } else if (cleanPhone.startsWith("218")) {
                cleanPhone = "+" + cleanPhone;
            } else if (!cleanPhone.startsWith("+")) {
                // Must be local number like 91xxxxxxx without 0? default to +218
                if (cleanPhone.length === 9) {
                    cleanPhone = "+218" + cleanPhone;
                }
            }

            console.log(`[DarbSabil] Phone Normalized: ${rawPhone} -> ${cleanPhone}`);

            const contactPayload = {
                name: orderData.customerName.trim(),
                phone: cleanPhone
            };

            let contactId;
            try {
                const contactResponse = await this.request("POST", "/api/contacts", contactPayload);
                contactId = contactResponse.data?._id || contactResponse.data?.id || contactResponse.data?.data?._id;
            } catch (err: any) {
                // If creation fails (e.g. 502, timeout, or duplicate), log warning but continue to fallback search
                console.warn(`⚠️ Failed to create contact (Darb API Error): ${err.message}. Attempting to FIND contact instead.`);
            }

            if (!contactId) {
                // Try searching as failsafe if ID not returned directly
                try {
                    const searchResponse = await this.request("GET", `/api/contacts?search=${cleanPhone.replace('+', '')}`);
                    const contacts = searchResponse.data?.data || searchResponse.data || [];
                    const found = contacts.find((c: any) => c.phone === cleanPhone || c.phone === cleanPhone.replace('+', ''));
                    if (found) contactId = found._id || found.id;
                } catch (e) { console.warn("Search fallback failed"); }
            }

            if (!contactId) {
                throw new Error("Failed to retrieve Contact ID from Darb Sabil API.");
            }
            console.log("Contact ID obtained:", contactId);

            // Service ID retrieved from verification
            const SERVICE_ID = "6783c612dcf305c9e775c987";

            const cityName = isNaN(Number(orderData.cityId)) ? orderData.cityId : this.mapCityIdToName(orderData.cityId) || "طرابلس";

            // Validate Area against City using our hierarchical map
            // This prevents "Unable to fetch branch" errors when area doesn't match city
            let areaName = orderData.area;
            const validAreas = await this.getAreas(cityName);

            if (validAreas && validAreas.length > 0) {
                const areaExists = validAreas.some(a => a.name === areaName);
                if (!areaExists) {
                    console.warn(`[DarbSabil] Area '${areaName}' is invalid for city '${cityName}'. Checking rules...`);

                    // 1. Try to find area with same name as city
                    const defaultArea = validAreas.find(a => a.name === cityName);
                    if (defaultArea) {
                        areaName = defaultArea.name;
                        console.log(`[DarbSabil] Auto-corrected area to '${areaName}'`);
                    } else {
                        // 2. Fallback to first available area
                        areaName = validAreas[0].name;
                        console.log(`[DarbSabil] Fallback area to '${areaName}'`);
                    }
                }
            } else {
                // Fallback for unknown cities (should be covered by map, but safety first)
                const MAJOR_CITIES_WITH_SUB_AREAS = ["طرابلس", "بنغازي", "مصراتة"];
                if (!MAJOR_CITIES_WITH_SUB_AREAS.includes(cityName)) {
                    areaName = cityName;
                } else if (!areaName) {
                    areaName = this.getDefaultArea(cityName);
                }
            }

            // 2. Create Shipment
            const shipmentPayload = {
                service: SERVICE_ID,
                contacts: [contactId],
                paymentBy: "receiver", // Default to receiver paying
                to: {
                    countryCode: "lby",
                    city: cityName,
                    area: areaName,
                    address: orderData.address || "Address"
                },
                products: [
                    {
                        title: `Order ${orderData.orderNumber}`,
                        amount: orderData.amount,
                        quantity: 1,
                        isChargeable: true,
                        currency: "lyd"
                    }
                ],
                notes: orderData.comment
            };

            console.log("Creating Shipment:", JSON.stringify(shipmentPayload, null, 2));
            const shipmentResponse = await this.request("POST", "/api/local/shipments", shipmentPayload);
            return shipmentResponse.data;

        } catch (error) {
            console.error("createOrder Failed", error);
            throw error;
        }
    }

    static async getTracking(trackingNumber: string) {
        // Using Public Tracking Endpoint found in docs
        return this.request("GET", `/api/public/local/shipments/${trackingNumber}`);
    }

    static async getShipments(limit: number = 20, offset: number = 0) {
        try {
            console.log(`📦 Fetching Darb Sabil shipments - Limit: ${limit}, Offset: ${offset}`);

            // Using the shared request method which uses the NEW API_KEY
            // passing query params in the query string
            const endpoint = `/api/local/shipments?limit=${limit}&offset=${offset}`;

            const responseData = await this.request("GET", endpoint);

            // Check different possible data structures
            let shipments = [];
            let total = 0;

            if (responseData?.data) {
                // If data is an array (list)
                if (Array.isArray(responseData.data)) {
                    shipments = responseData.data;
                    total = responseData.total || shipments.length;
                }
                // If data contains 'results' or similar (Postman schema style)
                else if (responseData.data.results) {
                    shipments = responseData.data.results;
                    total = responseData.data.totalCount || shipments.length;
                }
                // If data is just an object but implies a single item? obscure but possible
                else {
                    // Fallback, maybe it's just one object
                    shipments = [responseData.data];
                    total = 1;
                }
            } else if (Array.isArray(responseData)) {
                shipments = responseData;
                total = shipments.length;
            } else if (responseData?.list) {
                shipments = responseData.list;
                total = responseData.total || shipments.length;
            }

            console.log(`✅ Got ${shipments.length} shipments from Darb Sabil (Total: ${total})`);

            return {
                data: shipments,
                total: total,
                limit: limit,
                offset: offset
            };
        } catch (error: any) {
            console.error("❌ Failed to fetch Darb Sabil shipments:", error.message);
            // Return empty result gracefully
            return {
                data: [],
                total: 0,
                error: error.message || "Failed to load shipments"
            };
        }
    }
}
