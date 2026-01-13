
import crypto from 'crypto';
import axios from 'axios';

interface MoamalatConfig {
    merchantId: string;
    terminalId: string;
    secretKey: string;
}

// These should ideally come from environment variables
const config: MoamalatConfig = {
    merchantId: process.env.MOAMALAT_MERCHANT_ID || "10081014649",
    terminalId: process.env.MOAMALAT_TERMINAL_ID || "99179395",
    // This looks like a plain hex key (32 chars = 16 bytes). 
    // The previous long key was likely hex-encoded string of a 32-byte key? 
    // Let's try the key EXACTLY as found for this merchant ID.
    secretKey: process.env.MOAMALAT_SECRET_KEY || "3a488a89b3f7993476c252f017c488bb",
};

export class MoamalatService {
    /**
     * Generates the DateTimeLocalTrxn string in format YYYYMMDDHHmm
     */
    static generateDateTime(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        return `${year}${month}${day}${hour}${minute}`;
    }

    /**
     * hexDecodes the key string to a Buffer
     */
    private static hexDecode(hex: string): Buffer {
        // Simple hex validation
        if (!/^[0-9a-fA-F]+$/.test(hex)) {
            console.error("MoamalatService: Invalid hex string for secret key:", hex);
            // Fallback for non-hex keys if that's ever a case, though unlikely for Moamalat
            // throw new Error("Invalid hex string for secret key");
        }
        return Buffer.from(hex, 'hex');
    }

    /**
     * Generates the SecureHash for the transaction request
     */
    static generateRequestHash(amount: string, dateTime: string, merchantReference: string): string {
        const { merchantId, terminalId, secretKey } = config;

        // Fields to be included in the hash, sorted alphabetically by parameter name
        // Amount, DateTimeLocalTrxn, MerchantId, MerchantReference, TerminalId
        const params = new Map<string, string>();
        params.set('Amount', amount);
        params.set('DateTimeLocalTrxn', dateTime);
        params.set('MerchantId', merchantId);
        params.set('MerchantReference', merchantReference);
        params.set('TerminalId', terminalId);

        // Sort keys
        const sortedKeys = Array.from(params.keys()).sort();

        // Construct the string
        const stringParts = sortedKeys.map(key => `${key}=${params.get(key)}`);
        const dataString = stringParts.join('&');

        console.log("Moamalat Hash Data String:", dataString);

        // Create HMAC
        // key must be hex decoded
        const keyBuffer = this.hexDecode(secretKey);
        const hmac = crypto.createHmac('sha256', keyBuffer);
        hmac.update(dataString);
        const hash = hmac.digest('hex').toUpperCase();

        return hash;
    }

    static getConfig() {
        return config;
    }

    private static readonly TEST_FILTER_URL = "https://tnpg.moamalat.net/cube/paylink.svc/api/FilterTransactions";
    private static readonly PROD_FILTER_URL = "https://npg.moamalat.net/cube/paylink.svc/api/FilterTransactions";

    /**
     * Verifies the status of a transaction using Moamalat Filter API
     */
    static async verifyTransaction(merchantReference: string): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const { merchantId, terminalId, secretKey } = config;
            // Generate DateTime
            const dateTime = this.generateDateTime();

            // Hash for Data Service includes: DateTimeLocalTrxn, MerchantId, TerminalId
            const params = new Map<string, string>();
            params.set('DateTimeLocalTrxn', dateTime);
            params.set('MerchantId', merchantId);
            params.set('TerminalId', terminalId);

            const sortedKeys = Array.from(params.keys()).sort();
            const stringParts = sortedKeys.map(key => `${key}=${params.get(key)}`);
            const dataString = stringParts.join('&');

            const keyBuffer = this.hexDecode(secretKey);
            const hmac = crypto.createHmac('sha256', keyBuffer);
            hmac.update(dataString);
            const secureHash = hmac.digest('hex').toUpperCase();

            // Prepare Payload
            const payload = {
                MerchantId: merchantId,
                TerminalId: terminalId,
                MerchantReference: merchantReference,
                DateTimeLocalTrxn: dateTime,
                DisplayLength: "1",
                DisplayStart: "0",
                SecureHash: secureHash
            };

            console.log(`[Moamalat] Verifying Ref: ${merchantReference}`);

            // Determine URL based on Merchant ID (Prod starts with 1008 usually)
            // Or fallback to PROD if unknown logic, maybe check env?
            // Safer: If ID length > 6 -> Prod? (45374 vs 10081014649)
            const isProd = merchantId.length > 8;
            const url = isProd ? this.PROD_FILTER_URL : this.TEST_FILTER_URL;

            const response = await axios.post(url, payload);
            const body = response.data;

            if (body && body.Success) {
                if (body.Transactions && body.Transactions.length > 0) {
                    const transaction = body.Transactions[0];
                    // Check Status
                    // Status can be "Approved" or others.
                    const isApproved = transaction.Status === "Approved";

                    return {
                        success: isApproved,
                        data: transaction
                    };
                } else {
                    return { success: false, error: "Transaction not found" };
                }
            } else {
                return { success: false, error: body?.Message || "API Error" };
            }

        } catch (error: any) {
            console.error("Moamalat Verification Error:", error.response?.data || error.message);
            return { success: false, error: error.message };
        }
    }
}
