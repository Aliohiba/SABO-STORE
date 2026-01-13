/**
 * Guest Cart Management
 * Manages shopping cart for non-authenticated users using localStorage
 */

export interface GuestCartItem {
    productId: string;
    quantity: number;
    addedAt: number; // timestamp
}

const GUEST_CART_KEY = 'sabo_guest_cart';

export const guestCart = {
    /**
     * Get all items from guest cart
     */
    getItems(): GuestCartItem[] {
        try {
            const items = localStorage.getItem(GUEST_CART_KEY);
            return items ? JSON.parse(items) : [];
        } catch (error) {
            console.error('[GuestCart] Error reading cart:', error);
            return [];
        }
    },

    /**
     * Add item to cart or increase quantity if already exists
     */
    addItem(productId: string, quantity: number = 1): void {
        try {
            const items = this.getItems();
            const existingIndex = items.findIndex(i => i.productId === productId);

            if (existingIndex >= 0) {
                items[existingIndex].quantity += quantity;
            } else {
                items.push({
                    productId,
                    quantity,
                    addedAt: Date.now()
                });
            }

            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
            console.log(`[GuestCart] Added ${quantity}x product ${productId}`);
        } catch (error) {
            console.error('[GuestCart] Error adding item:', error);
        }
    },

    /**
     * Remove item from cart
     */
    removeItem(productId: string): void {
        try {
            const items = this.getItems().filter(i => i.productId !== productId);
            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
            console.log(`[GuestCart] Removed product ${productId}`);
        } catch (error) {
            console.error('[GuestCart] Error removing item:', error);
        }
    },

    /**
     * Update item quantity
     */
    updateQuantity(productId: string, quantity: number): void {
        try {
            const items = this.getItems();
            const item = items.find(i => i.productId === productId);

            if (item) {
                if (quantity <= 0) {
                    this.removeItem(productId);
                } else {
                    item.quantity = quantity;
                    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
                    console.log(`[GuestCart] Updated product ${productId} quantity to ${quantity}`);
                }
            }
        } catch (error) {
            console.error('[GuestCart] Error updating quantity:', error);
        }
    },

    /**
     * Clear entire cart
     */
    clear(): void {
        try {
            localStorage.removeItem(GUEST_CART_KEY);
            console.log('[GuestCart] Cart cleared');
        } catch (error) {
            console.error('[GuestCart] Error clearing cart:', error);
        }
    },

    /**
     * Get total number of items in cart
     */
    getItemCount(): number {
        return this.getItems().reduce((total, item) => total + item.quantity, 0);
    },

    /**
     * Get product IDs in cart
     */
    getProductIds(): string[] {
        return this.getItems().map(item => item.productId);
    },

    /**
     * Check if product is in cart
     */
    hasProduct(productId: string): boolean {
        return this.getItems().some(item => item.productId === productId);
    },

    /**
     * Get quantity of specific product
     */
    getProductQuantity(productId: string): number {
        const item = this.getItems().find(i => i.productId === productId);
        return item?.quantity || 0;
    }
};
