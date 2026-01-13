/**
 * Cart Helper Functions
 * Provides unified cart operations for both authenticated users and guests
 */

import { guestCart } from './guestCart';
import type { UseTRPCMutationResult } from '@trpc/react-query/shared';

/**
 * Add item to cart (works for both logged-in users and guests)
 */
export const addToCart = (
    productId: string,
    quantity: number,
    isLoggedIn: boolean,
    addToCartMutation?: UseTRPCMutationResult<any, any, any, any>
) => {
    if (isLoggedIn && addToCartMutation) {
        // Use server mutation for logged-in users
        return addToCartMutation.mutateAsync({ productId, quantity });
    } else {
        // Use guest cart for non-logged-in users
        guestCart.addItem(productId, quantity);
        return Promise.resolve();
    }
};

/**
 * Merge guest cart with user cart after login
 */
export const mergeGuestCartWithUserCart = async (
    addToCartMutation: UseTRPCMutationResult<any, any, any, any>
) => {
    const guestItems = guestCart.getItems();

    if (guestItems.length === 0) {
        return;
    }

    console.log(`[CartHelper] Merging ${guestItems.length} guest cart items with user cart`);

    try {
        // Add each guest item to user's cart
        for (const item of guestItems) {
            await addToCartMutation.mutateAsync({
                productId: item.productId,
                quantity: item.quantity
            });
        }

        // Clear guest cart after successful merge
        guestCart.clear();
        console.log('[CartHelper] Guest cart merged and cleared successfully');
    } catch (error) {
        console.error('[CartHelper] Error merging guest cart:', error);
        throw error;
    }
};

/**
 * Get cart item count (for badge display)
 */
export const getCartItemCount = (
    isLoggedIn: boolean,
    serverCartItems?: any[]
): number => {
    if (isLoggedIn && serverCartItems) {
        return serverCartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    } else {
        return guestCart.getItemCount();
    }
};
