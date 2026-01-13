/**
 * WhatsApp Service for sending verification codes via SMS Mobile API
 * Documentation: https://smsmobileapi.com/
 */

interface WhatsAppConfig {
    apiKey: string;
    accountId: string;
    accountLicence: string;
    baseUrl?: string;
}

interface SendOTPParams {
    phone: string;
    otp: string;
}

interface SMSMobileAPIResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export class WhatsAppService {
    private config: WhatsAppConfig;

    constructor(config?: WhatsAppConfig) {
        // Get configuration from environment variables or passed config
        this.config = config || {
            apiKey: process.env.WHATSAPP_API_KEY || '',
            accountId: process.env.WHATSAPP_ACCOUNT_ID || '',
            accountLicence: process.env.WHATSAPP_ACCOUNT_LICENCE || '',
            baseUrl: process.env.WHATSAPP_BASE_URL || 'https://api.smsmobileapi.com',
        };

        // Validate configuration
        if (!this.config.apiKey || !this.config.accountId || !this.config.accountLicence) {
            console.warn('[WhatsApp] Missing configuration. WhatsApp service will not function properly.');
            console.warn('[WhatsApp] Required: WHATSAPP_API_KEY, WHATSAPP_ACCOUNT_ID, WHATSAPP_ACCOUNT_LICENCE');
        }
    }

    /**
     * Send OTP via WhatsApp using SMS Mobile API
     */
    async sendOTP({ phone, otp }: SendOTPParams): Promise<boolean> {
        try {
            // Format phone number (ensure it starts with country code, no + or 00)
            const formattedPhone = this.formatPhoneNumber(phone);

            // Prepare message in Arabic
            const message = `🔐 رمز التحقق الخاص بك هو: ${otp}\n\n✅ الرمز صالح لمدة 10 دقائق.\n⚠️ لا تشارك هذا الرمز مع أي شخص.`;

            // Build URL with query parameters
            const url = new URL(`${this.config.baseUrl}/sendsms`);
            url.searchParams.append('recipients', formattedPhone);
            url.searchParams.append('message', message);
            url.searchParams.append('apikey', this.config.apiKey);
            url.searchParams.append('waonly', 'yes'); // Send via WhatsApp ONLY (not SMS)
            url.searchParams.append('account_id', this.config.accountId);
            url.searchParams.append('account_licence', this.config.accountLicence);

            console.log(`[WhatsApp] Sending OTP to ${formattedPhone}...`);

            // Send request
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            // Check if request was successful
            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                console.error('[WhatsApp] Failed to send OTP. Status:', response.status);
                console.error('[WhatsApp] Error:', errorText);
                throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
            }

            // Parse response
            const result = await response.json().catch(() => ({ success: false })) as SMSMobileAPIResponse;

            if (result.success === false) {
                console.error('[WhatsApp] API returned error:', result.error || result.message);
                throw new Error(result.error || result.message || 'Unknown API error');
            }

            console.log(`[WhatsApp] ✅ OTP sent successfully to ${formattedPhone}`);
            console.log('[WhatsApp] Response:', result);

            return true;
        } catch (error) {
            console.error('[WhatsApp] Error sending OTP:', error);

            // In development, we might want to continue without throwing
            // In production, you might want to throw the error
            if (process.env.NODE_ENV === 'production') {
                throw error;
            }

            // In development, log the OTP for testing
            console.log(`[WhatsApp FALLBACK] OTP for testing: ${otp}`);
            return false;
        }
    }

    /**
     * Format phone number to international format without + or 00
     * Assumes Libyan phone numbers (+218) by default
     */
    private formatPhoneNumber(phone: string): string {
        // Remove any non-digit characters
        let cleaned = phone.replace(/\D/g, '');

        // Remove leading + or 00 if present
        if (cleaned.startsWith('00')) {
            cleaned = cleaned.substring(2);
        }

        // If starts with 0, replace with country code (218 for Libya)
        if (cleaned.startsWith('0')) {
            cleaned = '218' + cleaned.substring(1);
        }

        // If doesn't start with country code, add it
        if (!cleaned.startsWith('218')) {
            cleaned = '218' + cleaned;
        }

        return cleaned;
    }

    /**
     * Verify that the service is configured correctly
     */
    isConfigured(): boolean {
        return !!(this.config.apiKey && this.config.accountId && this.config.accountLicence);
    }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();
