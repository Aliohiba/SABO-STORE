import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MapPin, Edit, Store, Truck, CheckCircle, CreditCard, Wallet } from "lucide-react";
import CustomerNavbar from "@/components/CustomerNavbar";
import { useTranslation } from "react-i18next";
import { guestCart } from "@/lib/guestCart";


export default function Checkout() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const MoamalatLogo = () => (
    <div className="h-24 w-48 flex items-center justify-center">
      <img src="/moamalat.png" alt="Moamalat" className="max-h-full max-w-full object-contain mix-blend-multiply" />
    </div>
  );

  const CashLogo = () => (
    <div className="h-20 w-24 flex items-center justify-center">
      <img src="/cash-payment.png" alt="Cash on Delivery" className="max-h-full max-w-full object-contain mix-blend-multiply" />
    </div>
  );

  const LypayLogo = () => (
    <div className="h-24 w-48 flex items-center justify-center">
      <img src="/lypay.png" alt="LYPAY" className="max-h-full max-w-full object-contain mix-blend-multiply" />
    </div>
  );

  // Check authentication first
  const { data: customer, refetch: refetchCustomer } = trpc.customer.me.useQuery();
  const isLoggedIn = !!customer;

  // For logged-in users: fetch cart from server
  const { data: serverCartRaw = [] } = trpc.cart.list.useQuery(undefined, {
    enabled: isLoggedIn
  });

  // For guests: get cart from localStorage and fetch product data
  const guestProductIds = !isLoggedIn ? guestCart.getProductIds() : [];
  const { data: guestProducts = [] } = trpc.products.getByIds.useQuery(
    { ids: guestProductIds },
    { enabled: !isLoggedIn && guestProductIds.length > 0 }
  );

  // Build guest cart items with product data
  const guestCartItems = useMemo(() => {
    if (isLoggedIn) return [];

    const cartData = guestCart.getItems();
    return cartData.map(item => {
      const product = guestProducts.find(p => String(p._id) === item.productId);
      return {
        id: item.productId,
        _id: item.productId,
        productId: item.productId,
        quantity: item.quantity,
        product: product || null
      };
    }).filter(item => item.product); // Filter out items where product was not found
  }, [isLoggedIn, guestProducts]);

  // Use appropriate cart
  const rawCartItems = isLoggedIn ? serverCartRaw : guestCartItems;

  // Filter cart items based on URL params
  const cartItems = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const selectedItemIdsParam = searchParams.get('items');

    if (!selectedItemIdsParam) return rawCartItems;

    const selectedIds = selectedItemIdsParam.split(',');

    return rawCartItems.filter((rawItem: any) => {
      const item = rawItem._doc ? { ...rawItem._doc, product: rawItem.product || rawItem._doc.product } : rawItem;
      const itemId = String(item._id || item.id || '');
      return selectedIds.includes(itemId);
    });
  }, [rawCartItems]);

  const updateProfile = trpc.customer.updateProfile.useMutation();
  const { data: storeSettings } = trpc.storeSettings.get.useQuery();

  const initiateMoamalatPayment = trpc.moamalat.initiatePayment.useMutation();

  // Wallet Query
  const { data: walletData } = trpc.wallet.getWallet.useQuery(undefined, {
    enabled: isLoggedIn,
    refetchOnWindowFocus: false,
  });

  const createOrder = trpc.orders.create.useMutation();
  const confirmPayment = trpc.moamalat.confirmPayment.useMutation();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
    cityId: 0,
    area: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');

  // Initialize payment method based on available options
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'moamalat' | 'lypay'>('cash_on_delivery');

  // Update payment method when settings load if current method is disabled
  useEffect(() => {
    if (storeSettings?.paymentMethods) {
      // If current payment method is disabled, try to switch to an enabled one
      if (paymentMethod === 'cash_on_delivery' && storeSettings.paymentMethods.cash_on_delivery === false) {
        if (storeSettings.paymentMethods.moamalat !== false) setPaymentMethod('moamalat');
        else if (storeSettings.paymentMethods.lypay !== false) setPaymentMethod('lypay');
      } else if (paymentMethod === 'moamalat' && storeSettings.paymentMethods.moamalat === false) {
        if (storeSettings.paymentMethods.cash_on_delivery !== false) setPaymentMethod('cash_on_delivery');
        else if (storeSettings.paymentMethods.lypay !== false) setPaymentMethod('lypay');
      } else if (paymentMethod === 'lypay' && storeSettings.paymentMethods.lypay === false) {
        if (storeSettings.paymentMethods.cash_on_delivery !== false) setPaymentMethod('cash_on_delivery');
        else if (storeSettings.paymentMethods.moamalat !== false) setPaymentMethod('moamalat');
      }
    }
  }, [storeSettings, paymentMethod]);

  const [useWalletPartial, setUseWalletPartial] = useState(false);
  // Delivery Providers & Cities
  const [providerId, setProviderId] = useState('darb');
  const { data: providers = [] } = trpc.delivery.providers.useQuery();
  const { data: cities = [], isFetching: isFetchingCities } = trpc.delivery.cities.useQuery({ providerId });

  // Fetch customer's city from local DB (to get city name)
  const { data: customerCity } = trpc.cities.getById.useQuery(
    { id: customer?.cityId as string },
    { enabled: !!customer?.cityId && typeof customer.cityId === 'string' }
  );

  // Fetch regions directly from delivery provider
  const { data: regions = [] } = trpc.delivery.regions.useQuery(
    { providerId, cityId: formData.cityId },
    { enabled: !!formData.cityId && deliveryMethod === 'delivery' }
  );

  const [shippingPrice, setShippingPrice] = useState(0);

  // Update shipping price when area is selected (if region has specific price)
  useEffect(() => {
    if (formData.area && regions.length > 0) {
      const selectedRegion = regions.find((r: any) => r.name === formData.area);
      if (selectedRegion && typeof selectedRegion.price === 'number' && selectedRegion.price > 0) {
        setShippingPrice(selectedRegion.price);
        console.log(`[Checkout] Region price updated for "${selectedRegion.name}": ${selectedRegion.price} د.ل`);
      }
      // If region exists but has no price, keep the city price (already set)
    }
  }, [formData.area, regions, providerId]);

  // Auto-fill customer data if logged in
  useEffect(() => {
    if (customer) {
      setFormData({
        customerName: customer.name || "",
        customerEmail: customer.email || "",
        customerPhone: customer.phone || "",
        customerAddress: customer.address || "",
        notes: "",
        cityId: customer.cityId || 0,
        area: customer.area || "",
      });
    }
  }, [customer]);

  // Set shipping price based on customer's city (match by name with delivery provider cities)
  useEffect(() => {
    if (customer?.cityId && customerCity && cities.length > 0) {
      // Find matching city in delivery provider's cities by name
      const matchingProviderCity = cities.find((c: any) =>
        c.name?.trim().toLowerCase() === customerCity.name?.trim().toLowerCase()
      );

      if (matchingProviderCity) {
        setShippingPrice(matchingProviderCity.price || 0);
        // Update formData with delivery provider's cityId for order creation
        setFormData(prev => ({ ...prev, cityId: matchingProviderCity.id }));
        console.log(`[Checkout] Matched city "${customerCity.name}" - Price: ${matchingProviderCity.price} د.ل`);
      } else {
        console.warn(`[Checkout] Could not find matching city for "${customerCity.name}" in ${providerId} cities`);
        setShippingPrice(0);
      }
    }
  }, [customer, customerCity, cities, providerId]);

  // Update shipping price when provider changes and city is already selected
  useEffect(() => {
    if (formData.cityId && cities.length > 0) {
      const selectedCity = cities.find((c: any) => String(c.id) === String(formData.cityId));
      if (selectedCity) {
        setShippingPrice(selectedCity.price || 0);
        console.log(`[Checkout] Provider changed to ${providerId} - Updated price for "${selectedCity.name}": ${selectedCity.price} د.ل`);
      }
    }
  }, [providerId, cities, formData.cityId]);

  const handleCityChange = async (cityId: string) => {
    // Loose comparison to handle both string IDs (Darb) and number IDs (Vanex)
    const selectedCity = cities.find((c: any) => String(c.id) === String(cityId));
    if (selectedCity) {
      setFormData(prev => ({ ...prev, cityId: selectedCity.id, area: "" }));
      setShippingPrice(selectedCity.price || 0);
    }
  };

  const subtotal = cartItems.reduce((sum: number, item: any) => {
    const price = item.product ? parseFloat(item.product.price) : 0;
    return sum + price * item.quantity;
  }, 0);

  // Shipping is displayed for info only - customer pays delivery company directly
  const shipping = deliveryMethod === 'pickup' ? 0 : (shippingPrice > 0 ? shippingPrice : 0);
  const total = subtotal; // Total = products only, shipping NOT included

  // Wallet Logic
  const walletBalance = walletData?.balance || 0;
  const walletDeduction = useWalletPartial ? Math.min(walletBalance, total) : 0;
  const remainingTotal = Math.max(0, total - walletDeduction);
  const isFullyCoveredByWallet = useWalletPartial && remainingTotal === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error(t('checkout_page.cart_empty_error'));
      return;
    }

    if (!formData.customerName) {
      toast.error(t('checkout_page.validation_name'));
      return;
    }

    if (!formData.customerPhone) {
      toast.error(t('checkout_page.validation_phone'));
      return;
    }

    if (deliveryMethod === 'delivery' && (!formData.cityId || formData.cityId === 0)) {
      toast.error(t('checkout_page.validation_city'));
      return;
    }

    const items = cartItems.map((item: any) => ({
      productId: item.product?._id || item.id,
      quantity: item.quantity,
    }));

    console.log('[Checkout] Submitting order with formData:', {
      cityId: formData.cityId,
      area: formData.area,
      address: formData.customerAddress,
      provider: providerId
    });

    const payload: any = {
      items,
      paymentMethod,
      notes: formData.notes,
      useWalletPartial,
      deliveryCompanyId: deliveryMethod === 'delivery' ? providerId : undefined,
    };

    if (!isLoggedIn) {
      // Guest: Send all fields
      payload.customerName = formData.customerName;
      payload.customerEmail = formData.customerEmail;
      payload.customerPhone = formData.customerPhone;
      payload.customerAddress = deliveryMethod === 'pickup'
        ? t('checkout_page.pickup_address_value')
        : formData.customerAddress;
      payload.cityId = deliveryMethod === 'pickup' ? undefined : formData.cityId;
      payload.area = deliveryMethod === 'pickup' ? undefined : formData.area;
    } else {
      // Logged In: Backend resolves Name, Phone, Email, & Default Address from DB
      // Only send Address if it's a PICKUP (Store Address override)
      if (deliveryMethod === 'pickup') {
        payload.customerAddress = t('checkout_page.pickup_address_value');
        // cityId/area left undefined, backend uses Profile city (or 0 shipping if pickup logic handles it)
      } else {
        // Normal Delivery: Don't send anything, Backend uses Profile Address & City
      }
    }

    createOrder.mutate(payload,
      {
        onSuccess: async (result: any) => {
          const orderId = (result as any).insertId || (result as any)._id || 1;

          // Determine authoritative amount to pay from server response
          // This fixes issues where client-side 'total' might be 0 or stale
          const orderTotal = (result as any).totalAmount || total;

          let amountToPay = orderTotal;
          if ((result as any).paymentDetails?.remainingAmount !== undefined) {
            amountToPay = (result as any).paymentDetails.remainingAmount;
          } else if (useWalletPartial) {
            // Fallback logic if paymentDetails is missing but wallet was requested
            const deduction = Math.min(walletBalance, orderTotal);
            amountToPay = Math.max(0, orderTotal - deduction);
          }

          // Clear guest cart if not logged in
          if (!isLoggedIn) {
            guestCart.clear();
            // Trigger update for Navbar
            window.dispatchEvent(new Event('storage'));
          }

          if (paymentMethod === 'moamalat') {
            try {
              // Initialize Moamalat Payment
              const config = await initiateMoamalatPayment.mutateAsync({
                amount: amountToPay,
                orderId: String(orderId)
              });

              if (window.Lightbox) {
                window.Lightbox.Checkout.configure = {
                  MID: config.mid,
                  TID: config.tid,
                  AmountTrxn: config.amountTrxn,
                  MerchantReference: config.merchantReference,
                  TrxDateTime: config.trxDateTime,
                  SecureHash: config.secureHash,
                  completeCallback: async function (data: any) {
                    console.log("Payment Complete:", data);
                    try {
                      await confirmPayment.mutateAsync({
                        orderId: String(orderId),
                        transaction: data
                      });
                      toast.success(t('checkout_page.payment_confirmed_success'));
                    } catch (err) {
                      console.error("Failed to confirm payment status", err);
                    }
                    setLocation(`/order-confirmation/${orderId}`);
                  },
                  errorCallback: function (error: any) {
                    console.error("Payment Error:", error);
                    toast.error(t('checkout_page.payment_error'));
                  },
                  cancelCallback: function () {
                    console.log("Payment Cancelled");
                    toast.info(t('checkout_page.payment_cancelled'));
                  },
                };

                window.Lightbox.Checkout.showLightbox();
              } else {
                console.error("Lightbox script not loaded");
                toast.error(t('checkout_page.gateway_assist_error'));
              }
            } catch (error) {
              console.error("Failed to initiate payment:", error);
              toast.error(t('checkout_page.initiate_payment_failed'));
            }
          } else if (paymentMethod === 'lypay') {
            // Placeholder for LYPAY integration
            toast.success(t('checkout_page.lypay_success_msg'));
            setLocation(`/order-confirmation/${orderId}`);
          } else {
            // Cash on Delivery
            toast.success(t('checkout_page.order_success'));
            setLocation(`/order-confirmation/${orderId}`);
          }
        },
        onError: () => {
          toast.error(t('checkout_page.order_failed'));
        },
      }
    );
  };

  return (
    // ...
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <CustomerNavbar showSearch={false} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('checkout_page.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold mb-6">{t('checkout_page.delivery_info')}</h2>

              {/* Delivery Method Toggle */}
              <div className="bg-primary/10 p-4 rounded-lg mb-6 border border-primary/20">
                <label className="block font-bold mb-3 text-sm text-gray-700">{t('checkout_page.delivery_method')}</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${deliveryMethod === 'delivery'
                    ? 'bg-primary text-primary-foreground border-primary shadow-md transform scale-[1.02]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary/40 hover:bg-primary/10'
                    }`}>
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      <span className="font-medium">{t('checkout_page.door_delivery')}</span>
                    </div>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'delivery'}
                      onChange={() => setDeliveryMethod('delivery')}
                      className="hidden"
                    />
                    {deliveryMethod === 'delivery' && <CheckCircle className="h-4 w-4" />}
                  </label>

                  <label className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${deliveryMethod === 'pickup'
                    ? 'bg-primary text-primary-foreground border-primary shadow-md transform scale-[1.02]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary/40 hover:bg-primary/10'
                    }`}>
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      <span className="font-medium">{t('checkout_page.pickup')}</span>
                    </div>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'pickup'}
                      onChange={() => setDeliveryMethod('pickup')}
                      className="hidden"
                    />
                    {deliveryMethod === 'pickup' && <CheckCircle className="h-4 w-4" />}
                  </label>
                </div>
              </div>

              {/* Delivery Provider Selection (Only if Delivery is selected) */}
              {deliveryMethod === 'delivery' && providers.length > 0 && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium mb-4">{t('checkout_page.delivered_by')}</label>
                  <div className="grid grid-cols-2 gap-4">
                    {providers.map((p: any) => {
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setProviderId(p.id);
                          }}
                          className={`group relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${providerId === p.id
                            ? 'bg-primary/10 ring-2 ring-primary scale-105'
                            : 'hover:bg-gray-100/50 grayscale hover:grayscale-0'
                            }`}
                        >
                          {/* Logo */}
                          <div className="h-32 w-full flex items-center justify-center mb-2">
                            {p.logo ? (
                              <img
                                src={p.logo}
                                alt={p.name}
                                className={`h-full w-auto object-contain transition-transform duration-500 mix-blend-multiply ${providerId === p.id ? 'scale-110' : 'group-hover:scale-110'}`}
                              />
                            ) : (
                              <Truck className="h-16 w-16 text-gray-400" />
                            )}
                          </div>

                          {/* Provider Name - Visible on Hover or Selected */}
                          <span className={`font-bold text-lg text-center transition-all duration-300 ${providerId === p.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                            }`}>
                            {p.name_ar || p.name}
                          </span>

                          {/* Selection Indicator */}
                          {providerId === p.id && (
                            <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary shadow-sm animate-in zoom-in" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pickup Info */}
              {deliveryMethod === 'pickup' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start gap-3">
                    <Store className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-bold text-green-800 mb-1">{t('checkout_page.store_address')}</h3>
                      <p className="text-green-700 leading-relaxed">
                        {t('checkout_page.pickup_address_value')}
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        {t('checkout_page.store_hours')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Logged in user - Show saved address */}
              {isLoggedIn && !showAddressForm ? (
                <div className="space-y-4">
                  {/* Saved Address Display */}
                  <div className="border-2 border-primary rounded-lg p-4 bg-primary/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-lg">{t('checkout_page.address')}</h3>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddressForm(true)}
                        className="text-primary hover:text-primary/80"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t('common.edit')}
                      </Button>
                    </div>
                  </div>

                  {deliveryMethod === 'delivery' && (
                    <div className="space-y-2 text-gray-700 mt-4 border-t pt-4">
                      {formData.customerAddress && <p className="whitespace-pre-line">{formData.customerAddress}</p>}

                      {/* Show city and area from customer profile */}
                      {customerCity && (
                        <div className="space-y-1">
                          <p className="font-medium">
                            <span className="text-gray-600">{t('checkout_page.city_label')}</span>{' '}
                            <span className="text-gray-900">{customerCity.name}</span>
                          </p>
                          {formData.area && (
                            <p className="text-sm">
                              <span className="text-gray-600">{t('checkout_page.area_label')}</span>{' '}
                              <span className="text-gray-900">{formData.area}</span>
                            </p>
                          )}
                          {shippingPrice > 0 && (
                            <p className="font-bold text-primary text-lg mt-2">
                              {t('checkout_page.shipping_price_label')} {shippingPrice} د.ل
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('checkout_page.notes')}</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      placeholder={t('checkout_page.notes_placeholder')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ) : (
                /* Full Form for guests or when editing */
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('checkout_page.full_name')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('checkout_page.email')}</label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('checkout_page.phone')} *</label>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  {deliveryMethod === 'delivery' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      {/* City Selection */}
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('checkout_page.city')} <span className="text-red-500">*</span></label>
                        <select
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:text-gray-400"
                          onChange={(e) => handleCityChange(e.target.value)}
                          value={formData.cityId || ""}
                          disabled={isFetchingCities || cities.length === 0}
                        >
                          <option value="">
                            {isFetchingCities ? t('common.loading') : t('checkout_page.select_city')}
                          </option>
                          {cities.map((city: any) => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                        {cities.length === 0 && !isFetchingCities && providerId && (
                          <p className="text-xs text-amber-600 mt-1">{t('checkout_page.no_cities_available')}</p>
                        )}
                      </div>

                      {/* Area Selection */}
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('checkout_page.area')}</label>
                        {regions.length > 0 ? (
                          <select
                            value={formData.area || ""}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                          >
                            <option value="">{t('checkout_page.select_area')}</option>
                            {regions.map((region: any) => (
                              <option key={region._id || region.name} value={region.name}>
                                {region.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={formData.area || ""}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            placeholder={t('checkout_page.area_placeholder')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">{t('checkout_page.address')}</label>
                        <textarea
                          value={formData.customerAddress}
                          onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                          rows={3}
                          placeholder={t('checkout_page.address')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('checkout_page.notes')}</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  {isLoggedIn && showAddressForm && (
                    // ... same edit buttons ...
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={async () => {
                          try {
                            await updateProfile.mutateAsync({
                              name: formData.customerName,
                              email: formData.customerEmail || undefined,
                              cityId: formData.cityId || undefined,
                              area: formData.area || undefined,
                              address: formData.customerAddress || undefined,
                            });
                            toast.success(t('checkout_page.order_success').replace('order', 'changes'));
                            await refetchCustomer();
                            setShowAddressForm(false);
                          } catch (error) {
                            console.error('Failed to update profile:', error);
                            toast.error(t('checkout_page.order_failed').replace('order', 'changes'));
                          }
                        }}
                        disabled={updateProfile.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {updateProfile.isPending ? 'جاري الحفظ...' : t('common.save_changes')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // Reset to original customer data including city
                          if (customer) {
                            setFormData({
                              customerName: customer.name || "",
                              customerEmail: customer.email || "",
                              customerPhone: customer.phone || "",
                              customerAddress: customer.address || "",
                              notes: formData.notes,
                              cityId: customer.cityId || 0,
                              area: customer.area || "",
                            });
                            setProviderId('vanex'); // Reset provider if needed, or keep current
                          }
                          setShowAddressForm(false);
                        }}
                        className="flex-1"
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  )}
                </>
              )}

              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm mt-6">
                <h3 className="font-bold mb-4 text-lg">{t('checkout_page.payment_method')}</h3>

                {isLoggedIn && walletData && walletData.balance > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${useWalletPartial ? 'bg-purple-600 border-purple-600' : 'bg-white border-purple-300'}`}>
                        {useWalletPartial && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={useWalletPartial}
                        onChange={(e) => setUseWalletPartial(e.target.checked)}
                        className="hidden"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-purple-900">{t('checkout_page.use_wallet')}</div>
                        <div className="text-sm text-purple-700 mt-1">
                          {t('checkout_page.current_balance')} <span className="font-bold" dir="ltr">{walletData.balance.toFixed(2)} د.ل</span>
                          {useWalletPartial && (
                            <span className="block mt-1">{t('checkout_page.will_be_deducted')} <span className="font-bold">{walletDeduction.toFixed(2)} د.ل</span></span>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                )}

                {!isFullyCoveredByWallet && useWalletPartial && (
                  <div className="mb-2 text-sm text-gray-500 font-medium">{t('checkout_page.select_payment_for_remaining')} <span className="text-black font-bold">{remainingTotal.toFixed(2)} د.ل</span></div>
                )}

                {isFullyCoveredByWallet && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5" />
                    {t('checkout_page.full_wallet_coverage')}
                  </div>
                )}

                <div className={`flex flex-col gap-4 ${isFullyCoveredByWallet ? 'hidden' : ''}`}>
                  {/* Cash on Delivery Option */}
                  {(storeSettings?.paymentMethods?.cash_on_delivery !== false) && (
                    <div
                      onClick={() => setPaymentMethod('cash_on_delivery')}
                      className={`relative p-6 border rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'cash_on_delivery'
                        ? 'border-green-600 bg-green-50 ring-1 ring-green-600'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {/* Radio - Absolute Left */}
                      <div className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash_on_delivery' ? 'border-green-600' : 'border-gray-300'
                        }`}>
                        {paymentMethod === 'cash_on_delivery' && (
                          <div className="w-3 h-3 rounded-full bg-green-600" />
                        )}
                      </div>

                      {/* Center Content */}
                      <div className="w-full relative flex items-center justify-center min-h-[5rem]">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:block">
                          <CashLogo />
                        </div>
                        <div className="text-center z-10">
                          <span className="font-bold block text-gray-900 text-xl">{t('checkout_page.cod')}</span>
                          <span className="text-sm text-gray-500">{t('checkout_page.cod_desc')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Moamalat Option */}
                  {(storeSettings?.paymentMethods?.moamalat !== false) && (
                    <div
                      onClick={() => setPaymentMethod('moamalat')}
                      className={`relative p-6 border rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'moamalat'
                        ? 'border-primary bg-primary/10 ring-2 ring-primary'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {/* Badge - Top Right */}
                      <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3 z-20">
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full shadow-md flex items-center gap-1 border border-yellow-200 animate-pulse">
                          {t('checkout_page.same_as_cash')}
                        </span>
                      </div>

                      {/* Radio - Absolute Left */}
                      <div className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center z-20 ${paymentMethod === 'moamalat' ? 'border-primary' : 'border-gray-300'
                        }`}>
                        {paymentMethod === 'moamalat' && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>

                      {/* Center Content */}
                      <div className="w-full relative flex items-center justify-center min-h-[6rem]">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:block">
                          <MoamalatLogo />
                        </div>
                        <div className="text-center z-10">
                          <span className="font-bold block text-gray-900 text-xl">{t('checkout_page.moamalat')}</span>
                          <span className="text-sm text-gray-500">{t('checkout_page.moamalat_desc')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LYPAY Option */}
                  {(storeSettings?.paymentMethods?.lypay === true) && (
                    <div
                      onClick={() => setPaymentMethod('lypay')}
                      className={`relative p-6 border rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'lypay'
                        ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {/* Badge - Top Right */}
                      <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3 z-20">
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full shadow-md flex items-center gap-1 border border-yellow-200 animate-pulse">
                          نفس سعر الكاش
                        </span>
                      </div>

                      {/* Radio - Absolute Left */}
                      <div className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center z-20 ${paymentMethod === 'lypay' ? 'border-teal-500' : 'border-gray-300'
                        }`}>
                        {paymentMethod === 'lypay' && (
                          <div className="w-3 h-3 rounded-full bg-teal-500" />
                        )}
                      </div>

                      {/* Center Content */}
                      <div className="w-full relative flex items-center justify-center min-h-[6rem]">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:block">
                          <LypayLogo />
                        </div>
                        <div className="text-center z-10">
                          <span className="font-bold block text-gray-900 text-xl">{t('checkout_page.lypay')}</span>
                          <span className="text-sm text-gray-500">{t('checkout_page.lypay_desc')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning if no payment method available */}
                  {(storeSettings?.paymentMethods && !storeSettings.paymentMethods.cash_on_delivery && !storeSettings.paymentMethods.moamalat && !storeSettings.paymentMethods.lypay) && (
                    <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-center">
                      {t('checkout_page.no_payment_methods')}
                    </div>
                  )}

                </div>
              </div>

              {/* LYPAY QR Code Display */}
              {paymentMethod === 'lypay' && (
                <div className="bg-white p-6 rounded-lg border border-teal-200 shadow-sm mt-6 text-center animate-in fade-in zoom-in duration-300">
                  <h3 className="font-bold text-lg text-teal-800 mb-2">{t('checkout_page.scan_qr_title', 'امسح الرمز للدفع')}</h3>
                  <p className="text-sm text-gray-600 mb-4">{t('checkout_page.scan_qr_desc', 'قم بمسح رمز QR التالي باستخدام تطبيق LYPAY لإتمام عملية الدفع')}</p>

                  <div className="flex justify-center mb-4">
                    <div className="p-2 border-2 border-teal-500 rounded-xl bg-white shadow-md">
                      <img
                        src="/lypay-qr-code.png"
                        alt="LYPAY QR Code"
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                  </div>

                  <div className="text-sm text-teal-700 bg-teal-50 p-3 rounded-md inline-block">
                    {t('checkout_page.lypay_confirm_hint', 'بعد إتمام الدفع، اضغط على زر "تأكيد الطلب" في الأسفل')}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={createOrder.isPending || initiateMoamalatPayment.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg mt-6"
              >
                {createOrder.isPending || initiateMoamalatPayment.isPending ? t('checkout_page.processing') : t('checkout_page.confirm_order')}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-4">
              <h2 className="font-bold text-lg mb-4">{t('cart.order_summary')}</h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product?.name} x{item.quantity}</span>
                    <span className="font-bold">
                      د.ل {(parseFloat(item.product?.price || "0") * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.subtotal')}</span>
                  <span className="font-bold">د.ل {subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-4">
                <span className="font-bold text-lg">{t('cart.total')}</span>
                <span className="font-bold text-lg text-primary">د.ل {total.toFixed(2)}</span>
              </div>

              {useWalletPartial && walletDeduction > 0 && (
                <div className="flex justify-between mb-2 text-purple-700">
                  <span className="font-medium">{t('checkout_page.paid_from_wallet')}</span>
                  <span className="font-bold">- {walletDeduction.toFixed(2)} د.ل</span>
                </div>
              )}

              {useWalletPartial && (
                <div className="flex justify-between mb-4 pt-2 border-t border-dashed">
                  <span className="font-bold text-lg">{t('checkout_page.remaining_to_pay')}</span>
                  <span className="font-bold text-lg text-green-600">د.ل {remainingTotal.toFixed(2)}</span>
                </div>
              )}

              {/* Shipping info - paid to delivery company */}
              {deliveryMethod === 'delivery' && shipping > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900">{t('checkout_page.shipping_cost_title')}</p>
                      <p className="text-xs text-amber-700 mt-1">
                        <span className="font-bold">{shipping} د.ل</span> - {t('checkout_page.paid_to_delivery')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div >
    </div >
  );
}

declare global {
  interface Window {
    Lightbox: any;
  }
}
