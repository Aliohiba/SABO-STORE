

import axios from 'axios';
import { TRPCError } from '@trpc/server';
import citiesData from '../data/vanex_cities.json';
import * as fs from 'fs';
import * as path from 'path';

const VANEX_API_URL = 'https://app.vanex.ly/api/v1';

// In-memory cache for token
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

interface VanexAuthResponse {
    status_code: number;
    message: string;
    data: {
        access_token: string;
        token?: string;
        user: any;
    };
    errors: boolean;
    code: any;
}

interface VanexCity {
    id: number;
    name: string;
    price: number;
}

// Fallback Cities List
const FALLBACK_CITIES: VanexCity[] = citiesData;

export class VanexService {

    private static async getToken(forceRefresh = false): Promise<string> {
        // Force refresh if requested or return cached token if still valid
        if (!forceRefresh && cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
            return cachedToken;
        }

        // Clear cached token when forcing refresh
        if (forceRefresh) {
            console.log("♻️ Refreshing Vanex token...");
            cachedToken = null;
            tokenExpiry = null;
        }

        // Hardcoded credentials as per user request (should be in ENV in production)
        const email = "Aliohiba7@gmail.com";
        const password = "Ali15101996ohiba";

        try {
            console.log("Authenticating with Vanex...");
            const response = await axios.post<VanexAuthResponse>(`${VANEX_API_URL}/authenticate`, {
                email,
                password,
            });

            const responseData = response.data as any;
            const token = responseData?.data?.access_token || responseData?.data?.token || responseData?.access_token;

            if (token) {
                cachedToken = token;
                console.log("✅ Vanex Auth Successful. Token obtained.");
                tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
                return cachedToken as string;
            }

            console.error("Vanex Auth Response unexpected:", JSON.stringify(responseData, null, 2));
            throw new Error("No token returned in params");
        } catch (error: any) {
            console.error("VANEX Authentication failed:", error.response?.data || error.message);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to authenticate with Delivery Service"
            });
        }
    }

    /**
     * Round a numeric value to the nearest 0.25 increment as required by Vanex API.
     */
    private static roundToQuarter(value: number): number {
        return Math.round(value * 4) / 4;
    }

    /**
     * Make an authenticated request to Vanex API with automatic token refresh on 401
     */
    private static async makeAuthenticatedRequest<T = any>(
        method: 'get' | 'post' | 'put' | 'delete',
        url: string,
        data?: any,
        retryCount = 0
    ): Promise<T> {
        const token = await this.getToken();

        try {
            const response = await axios({
                method,
                url: `${VANEX_API_URL}${url}`,
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            return response.data as T;
        } catch (error: any) {
            // Handle 401 Unauthorized - token expired or invalid
            if (error.response?.status === 401 && retryCount === 0) {
                console.warn("⚠️ Vanex API returned 401. Re-authenticating...");

                // Force token refresh
                await this.getToken(true);

                // Retry the request once with new token
                return this.makeAuthenticatedRequest<T>(method, url, data, retryCount + 1);
            }

            // Re-throw for other errors
            throw error;
        }
    }

    static async getCities(): Promise<VanexCity[]> {
        try {
            // Try to fetch from API first
            const cities = await this.makeAuthenticatedRequest('get', '/cities');
            if (Array.isArray(cities) && cities.length > 0) {
                return cities;
            }
            return FALLBACK_CITIES;
        } catch (error: any) {
            // Suppress 404 logs as they are expected when using fallback
            if (error.response?.status !== 404) {
                console.warn("Failed to fetch cities from API, using fallback:", error.message);
            }
            return FALLBACK_CITIES;
        }
    }

    static async getRegions(cityId: number): Promise<{ id: number; name: string }[]> {
        try {
            console.log(`[Vanex] Fetching regions for cityId: ${cityId}`);

            // Load regions from local fallback data
            const regionsData = await import('../data/city_regions.json');
            const cityRegions = (regionsData as any)[String(cityId)];

            if (cityRegions && Array.isArray(cityRegions.regions)) {
                console.log(`[Vanex] Found ${cityRegions.regions.length} regions for ${cityRegions.cityName}`);
                return cityRegions.regions;
            }

            console.log(`[Vanex] No regions found for city ${cityId}`);
            return [];
        } catch (error: any) {
            console.warn(`[Vanex] Failed to fetch regions for city ${cityId}:`, error.message);
            return [];
        }
    }

    static async getDeliveryPrice(cityId: number): Promise<number> {
        const cities = await this.getCities();
        const city = cities.find(c => c.id === cityId);
        return city ? city.price : 0;
    }

    static async createOrder(orderData: {
        customerName: string;
        customerPhone: string;
        cityId: number;
        address: string;
        totalPrice: number;
        note?: string;
    }) {
        // Dynamic import to avoid circular dependencies if any, though here it should be fine
        const { getVanexSetting } = await import('../db-mongo-extended');
        const settings = await getVanexSetting();

        try {
            console.log("Creating Vanex Order:", orderData);
            console.log("Using Vanex Settings:", settings);

            const payload: any = {
                // Core Fields (V2 Endpoint specific spelling)
                type: 1, // 1: Commercial (Default)
                reciever: orderData.customerName, // Note: misspelling in API
                phone: orderData.customerPhone,
                city: orderData.cityId,
                address: orderData.address,
                price: this.roundToQuarter(orderData.totalPrice),
                qty: 1, // Documentation says 'qty', not 'quantity'
                notes: orderData.note || "",

                // Defaults & Required Dimensions
                height: 10,
                width: 10,
                leangh: 10, // Note: misspelling in API
                description: "Bookstore Order / طلبية متجر",

                // Defaults
                payment_methode: "cash", // enum: ["cash", "cheque", "epayment"]

                // Optional Configuration from Settings
                paid_by: settings?.costOnAccount === 'store' ? 'market' : 'customer',
                commission_by: settings?.commissionOnAccount === 'store' ? 'market' : 'customer',
                extra_size_by: settings?.additionalCostOnAccount === 'store' ? 'market' : 'customer',

                // Boolean Flags mapped to V2 parameters
                can_validate: settings?.allowInspection ? 1 : 0,

                // Special handling notes
                sticker_notes: [
                    settings?.isFragile ? "Fragile/قابل للكسر" : "",
                    settings?.needsSafePackaging ? "Safe Packaging/تغليف آمن" : "",
                    settings?.isHeatSensitive ? "Heat Sensitive/لا يتحمل الحرارة" : "",
                    settings?.allowMeasurement ? "Allow Measurement/مسموح بالقياس" : "",
                    settings?.allow50Note ? "Allow 50 Note" : ""
                ].filter(Boolean).join(" - "),
            };

            console.log("Vanex Payload:", JSON.stringify(payload, null, 2));

            // Use makeAuthenticatedRequest with automatic 401 retry
            const response = await this.makeAuthenticatedRequest('post', '/customer/package', payload);

            // Mapping based on observed response structure
            const responseData = response as any;
            if (responseData.package_code) {
                return {
                    trackingNumber: responseData.package_code,
                    vanexId: responseData.data?.id || responseData.package_code // Fallback if ID is missing
                };
            }

            if (response && response.params && response.params.id) {
                return {
                    trackingNumber: response.params.track_code || String(response.params.id),
                    vanexId: response.params.id
                };
            }

            // Fallback if structure is different
            return response;

        } catch (error: any) {
            console.error("Failed to create Vanex order:", error.response?.data || error.message);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create shipment with Delivery Service. " + (error.response?.data?.message || "")
            });
        }
    }

    static async getTracking(code: string) {
        try {
            // Public endpoint, no auth required
            const response = await axios.get(`${VANEX_API_URL}/tracking`, {
                params: { code }
            });
            return response.data;
        } catch (error: any) {
            console.error("Failed to track package:", error.response?.data || error.message);
            // Return null or throw? User wants it to appear. 
            // If it fails (e.g. 404), maybe just return error info.
            if (error.response?.status === 404) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Tracking code not found"
                });
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to track package. " + (error.response?.data?.message || "")
            });
        }
    }

    static async getShipments(page = 1) {
        try {
            console.log(`[Vanex] Fetching shipments page ${page}...`);
            const response = await this.makeAuthenticatedRequest('get', `/customer/package?page=${page}`);
            return response;
        } catch (error: any) {
            console.error("Failed to fetch shipments:", error.response?.data || error.message);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch shipments from Vanex"
            });
        }
    }
}
