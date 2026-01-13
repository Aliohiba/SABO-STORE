import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import CustomerNavbar from "@/components/CustomerNavbar";
import { useTranslation } from "react-i18next";
import { guestCart } from "@/lib/guestCart";

export default function Cart() {
  const { t } = useTranslation();

  // Check if user is authenticated
  const { data: customer } = trpc.customer.me.useQuery();
  const isLoggedIn = !!customer;

  // Server cart (for logged-in users)
  const { data: serverCartItems = [], refetch } = trpc.cart.list.useQuery(undefined, {
    enabled: isLoggedIn
  });
  const removeItem = trpc.cart.remove.useMutation();
  const updateQuantity = trpc.cart.updateQuantity.useMutation();

  // Local state for guest cart
  const [guestCartItems, setGuestCartItems] = useState<any[]>([]);
  const [guestCartLoading, setGuestCartLoading] = useState(true);

  // Fetch guest cart products
  const guestProductIds = guestCart.getProductIds();
  const { data: guestProducts = [] } = trpc.products.getByIds.useQuery(
    { ids: guestProductIds },
    { enabled: !isLoggedIn && guestProductIds.length > 0 }
  );

  // Build guest cart items with product data
  useEffect(() => {
    if (!isLoggedIn) {
      const cartData = guestCart.getItems();
      const itemsWithProducts = cartData.map(item => {
        const product = guestProducts.find(p => String(p._id) === item.productId);
        return {
          id: item.productId,
          _id: item.productId,
          productId: item.productId,
          quantity: item.quantity,
          product: product || null
        };
      }).filter(item => item.product); // Filter out items where product was not found

      setGuestCartItems(itemsWithProducts);
      setGuestCartLoading(false);
    }
  }, [isLoggedIn, guestProducts]);

  // Use appropriate cart based on auth status
  const cartItems = isLoggedIn ? serverCartItems : guestCartItems;
  const isLoading = isLoggedIn ? false : guestCartLoading;

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize selection when items are loaded
  useEffect(() => {
    if (cartItems.length > 0 && !isInitialized) {
      const allIds = cartItems.map((rawItem: any) => {
        const item = rawItem._doc ? { ...rawItem._doc, product: rawItem.product || rawItem._doc.product } : rawItem;
        return String(item._id || item.id || '');
      }).filter((id: string) => id);
      setSelectedItems(allIds);
      setIsInitialized(true);
    }
  }, [cartItems, isInitialized]);

  const handleRemoveItem = (id: string | number) => {
    const itemId = String(id);

    if (isLoggedIn) {
      // Remove from server
      removeItem.mutate(
        { id: itemId },
        {
          onSuccess: () => {
            refetch();
            toast.success("تم حذف المنتج من السلة");
            setSelectedItems(prev => prev.filter(i => i !== itemId));
          },
        }
      );
    } else {
      // Remove from local storage
      guestCart.removeItem(itemId);
      setSelectedItems(prev => prev.filter(i => i !== itemId));
      setGuestCartItems(prev => prev.filter(item => String(item.id) !== itemId));
      toast.success("تم حذف المنتج من السلة");
    }
  };

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity < 1) return;
    const itemId = String(id);

    if (isLoggedIn) {
      // Update on server
      updateQuantity.mutate(
        { id: itemId, quantity },
        {
          onSuccess: () => {
            refetch();
          },
        }
      );
    } else {
      // Update in local storage
      guestCart.updateQuantity(itemId, quantity);
      setGuestCartItems(prev => prev.map(item =>
        String(item.id) === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      const allIds = cartItems.map((rawItem: any) => {
        const item = rawItem._doc ? { ...rawItem._doc, product: rawItem.product || rawItem._doc.product } : rawItem;
        return String(item._id || item.id || '');
      }).filter((id: string) => id);
      setSelectedItems(allIds);
    }
  };

  const filteredItems = cartItems.filter((rawItem: any) => {
    const item = rawItem._doc ? { ...rawItem._doc, product: rawItem.product || rawItem._doc.product } : rawItem;
    const itemId = String(item._id || item.id || '');
    return selectedItems.includes(itemId);
  });

  const subtotal = filteredItems.reduce((sum: number, rawItem: any) => {
    const item = rawItem._doc ? { ...rawItem._doc, product: rawItem.product || rawItem._doc.product } : rawItem;
    const priceRaw = item.product ? item.product.price : 0;
    const price = parseFloat(priceRaw);
    return sum + (isNaN(price) ? 0 : price) * item.quantity;
  }, 0);

  const shipping = 0;
  const total = subtotal + shipping;

  const checkoutUrl = selectedItems.length > 0
    ? `/checkout?items=${selectedItems.join(',')}`
    : "#";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar showSearch={false} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <CustomerNavbar showSearch={false} />

      <div className="container mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">{t('nav.cart')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">{t('cart.empty')}</p>
                <Link href="/products">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {t('cart.browse_products')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All Header */}
                <div className="bg-white rounded-lg p-4 flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                    onChange={toggleAll}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/30"
                  />
                  <span className="font-medium">{t('cart.select_all')} ({cartItems.length})</span>
                </div>

                {cartItems.map((rawItem: any) => {
                  const item = rawItem._doc ? { ...rawItem._doc, product: rawItem.product || rawItem._doc.product } : rawItem;
                  const itemId = String(item._id || item.id || '');

                  if (!itemId) {
                    console.error('Cart item missing ID:', rawItem);
                    return null;
                  }

                  const isSelected = selectedItems.includes(itemId);

                  return (
                    <div key={itemId} className={`bg-white rounded-lg p-4 flex gap-4 ${isSelected ? 'border-2 border-primary' : 'border border-transparent'}`}>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(itemId)}
                          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/30"
                        />
                      </div>

                      {item.product?.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{item.product?.name}</h3>
                        <p className="text-primary font-bold mb-3">
                          د.ل {(() => {
                            const p = parseFloat(item.product?.price || "0");
                            return (isNaN(p) ? 0 : p).toFixed(2);
                          })()}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded text-xs"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded text-xs"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(itemId)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 md:p-6 sticky top-20 md:top-4">
              <h2 className="font-bold text-lg mb-4">{t('cart.order_summary')}</h2>
              <p className="text-sm text-gray-500 mb-4">{t('cart.selected_items', { count: selectedItems.length })}</p>

              <div className="space-y-2 md:space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">{t('cart.subtotal')}</span>
                  <span className="font-bold">د.ل {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">{t('cart.shipping')}</span>
                  <span className="font-bold">د.ل {shipping.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-4 md:mb-6">
                <span className="font-bold text-base md:text-lg">{t('cart.total')}</span>
                <span className="font-bold text-base md:text-lg text-primary">د.ل {total.toFixed(2)}</span>
              </div>

              <Link href={checkoutUrl}>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={selectedItems.length === 0}
                >
                  {t('cart.checkout')}
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="outline" className="w-full mt-2">
                  {t('cart.continue_shopping')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
