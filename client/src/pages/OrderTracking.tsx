import { useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Package, Truck, CheckCircle, Clock, Printer } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import CustomerNavbar from "@/components/CustomerNavbar";

export default function OrderTracking() {
  const { t } = useTranslation();
  const params = useParams<{ key?: string }>();
  const trackingKey = params.key || "";
  const [searchKey, setSearchKey] = useState(trackingKey);
  const [currentKey, setCurrentKey] = useState(trackingKey);

  // Use public trackByKey endpoint instead of getById
  const { data: order, isLoading, error } = trpc.orders.trackByKey.useQuery(
    { trackingKey: currentKey },
    { enabled: !!currentKey, retry: false }
  );

  // Fetch Vanex tracking if code exists
  const { data: trackingInfo } = trpc.vanex.track.useQuery(
    { code: order?.trackingCode || "" },
    { enabled: !!order?.trackingCode }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKey.trim()) {
      setCurrentKey(searchKey.trim().toUpperCase());
      // Update URL without page reload
      window.history.pushState({}, '', `/track/${searchKey.trim().toUpperCase()}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "store_new": // Vanex status
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case "confirmed":
      case "received": // Vanex status
        return <CheckCircle className="h-6 w-6 text-primary" />;
      case "shipped":
      case "in_transit": // Vanex status
        return <Truck className="h-6 w-6 text-primary" />;
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      default:
        return <Package className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: t('tracking.pending'),
      confirmed: t('tracking.confirmed'),
      shipped: t('tracking.status_shipped'),
      delivered: t('tracking.status_delivered'),
      cancelled: t('tracking.status_cancelled'),
      // Vanex Statuses
      store_new: t('tracking.status_received'),
      received: t('tracking.status_in_store'),
      in_transit: t('tracking.status_in_transit'),
      returned: t('tracking.status_returned'),
    };
    return statusMap[status] || status;
  };

  if (!currentKey) {
    // Show search form when no tracking key in URL
    return (
      <div className="min-h-screen bg-background">
        <CustomerNavbar showSearch={false} />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <Package className="h-16 w-16 mx-auto text-primary mb-4" />
              <h1 className="text-3xl font-bold mb-2">{t('tracking.track_your_order')}</h1>
              <p className="text-muted-foreground">{t('tracking.enter_code_desc')}</p>
            </div>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value.toUpperCase())}
                  placeholder="TRK-XXXXXXXXXXXX"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg font-mono"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {t('tracking.track_btn')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerNavbar showSearch={false} />
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          {t('tracking.loading')}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerNavbar showSearch={false} />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-red-800 mb-2">{t('tracking.order_not_found')}</h2>
              <p className="text-red-600">{t('tracking.code_not_found')}</p>
            </div>
            <form onSubmit={handleSearch} className="space-y-4">
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value.toUpperCase())}
                placeholder="TRK-XXXXXXXXXXXX"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg font-mono"
              />
              <Button type="submit" className="w-full">
                {t('tracking.search_again')}
              </Button>
            </form>
            <Link href="/" className="block mt-4">
              <Button variant="outline" className="w-full">
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Use Vanex status if available, otherwise internal status
  // Handle various potential Vanex API response structures
  const vanexData = trackingInfo?.data as any;
  const vanexStatus =
    vanexData?.status ||
    vanexData?.status_value ||
    vanexData?.data?.status_object?.status_value ||
    vanexData?.data?.status ||
    (typeof vanexData?.status === 'object' ? vanexData.status.value : undefined);

  const currentStatus = vanexStatus ? vanexStatus : order.status;
  const trackingCode = (order as any).trackingCode;

  // Invoice calculations
  const orderItems = (order as any).items || [];
  const subTotal = orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const shippingCost = (order as any).shippingCost ?? Math.max(0, Number(order.totalAmount) - subTotal);

  return (
    <div className="min-h-screen bg-background">
      <CustomerNavbar showSearch={false} />

      <div className="container mx-auto px-4 py-8 print:hidden">
        <h1 className="text-3xl font-bold mb-8 text-foreground">{t('tracking.track_your_order')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg p-6 mb-6 border border-border shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-card-foreground">{t('tracking.order_status')}</h2>

              <div className="bg-primary/5 rounded-lg p-6 mb-6 border border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="bg-card rounded-full p-3 shadow-md border border-border">
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{t('tracking.current_status')}</p>
                    <p className="text-3xl font-bold text-foreground">{getStatusText(order.status)}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('confirmation.order_number')}: <span className="font-semibold text-foreground">{order.orderNumber}</span>
                    </p>
                    {trackingCode && (
                      <p className="text-sm text-primary mt-1">
                        {t('tracking.tracking_number')}: <span className="font-semibold">{trackingCode}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="font-semibold text-muted-foreground mb-3">{t('tracking.order_stages')}</h3>
                {[
                  { key: "pending", label: t('tracking.status_received') },
                  { key: "confirmed", label: t('tracking.status_confirmed') },
                  { key: "shipped", label: t('tracking.status_shipped') },
                  { key: "delivered", label: t('tracking.status_delivered') }
                ].map((stage, idx) => {
                  const statusOrder = ["pending", "confirmed", "shipped", "delivered"];
                  const currentIndex = statusOrder.indexOf(order.status);
                  const isActive = currentIndex >= idx;
                  const isCurrent = order.status === stage.key;

                  const stageColors = {
                    pending: { bg: "bg-yellow-500", border: "border-yellow-500", text: "text-yellow-600" },
                    confirmed: { bg: "bg-primary", border: "border-primary", text: "text-primary" },
                    shipped: { bg: "bg-primary", border: "border-primary", text: "text-primary" },
                    delivered: { bg: "bg-green-600", border: "border-green-600", text: "text-green-600" },
                  };
                  const colors = stageColors[stage.key as keyof typeof stageColors];

                  return (
                    <div key={stage.key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCurrent
                            ? `${colors.bg} text-white ${colors.border} shadow-md`
                            : isActive
                              ? "bg-primary/80 text-primary-foreground border-primary/80"
                              : "bg-muted text-muted-foreground border-border"
                            }`}
                        >
                          {(isActive && !isCurrent) || (stage.key === 'delivered' && isCurrent) ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="font-bold">{idx + 1}</span>
                          )}
                        </div>
                        {idx < 3 && (
                          <div
                            className={`w-0.5 h-12 transition-colors ${isActive ? "bg-primary/80" : "bg-border"
                              }`}
                          />
                        )}
                      </div>
                      <div className="pt-2 flex-1">
                        <p className={`font-semibold ${isCurrent
                          ? colors.text
                          : isActive ? "text-primary" : "text-muted-foreground"
                          }`}>
                          {stage.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {t('tracking.current_status')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card rounded-lg p-6 mb-6 border border-border shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-card-foreground">{t('tracking.products')}</h2>
              <div className="space-y-4">
                {(order as any).items?.map((item: any) => (
                  <div key={item.id || item._id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{t('tracking.quantity')} {item.quantity}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground">{item.price} د.ل</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-card-foreground">{t('tracking.shipping_details')}</h2>

              <div className="space-y-3 pb-4 border-b border-border mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('confirmation.order_number')}</span>
                  <span className="font-bold text-foreground">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tracking.order_date')}</span>
                  <span className="font-bold text-foreground">{new Date(order.createdAt).toLocaleDateString("ar-LY")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('tracking.payment_method')}</span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-foreground">
                      {order.paymentMethod === 'moamalat' ? t('tracking.payment_moamalat') :
                        order.paymentMethod === 'lypay' ? (order.isPaid ? t('tracking.payment_lypay_paid') : t('tracking.payment_lypay_pending')) :
                          t('tracking.payment_cod')}
                    </span>
                    {(order as any).isPaid && (
                      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 px-2 py-0.5 text-xs shadow-none whitespace-nowrap">
                        <CheckCircle className="w-3 h-3 fill-current ml-1" />
                        {t('tracking.paid')}
                      </Badge>
                    )}
                    {order.paymentMethod === 'lypay' && !(order as any).isPaid && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200 px-2 py-0.5 text-xs whitespace-nowrap animate-pulse">
                        {t('tracking.waiting_payment')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Customer details hidden for privacy on public tracking */}
                {/*
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الاسم</span>
                  <span className="font-bold text-foreground">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">البريد الإلكتروني</span>
                  <span className="font-bold text-foreground">{order.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الهاتف</span>
                  <span className="font-bold text-foreground">{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">العنوان</span>
                  <span className="font-bold text-right text-foreground">{order.customerAddress}</span>
                </div>
                */}
                {trackingInfo?.data?.fees && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('tracking.estimated_shipping')}</span>
                    <span className="font-bold">{trackingInfo.data.fees.cost} د.ل</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 sticky top-4 border border-border shadow-sm">
              <h2 className="font-bold text-lg mb-4 text-card-foreground">{t('tracking.order_summary')}</h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tracking.total')}</span>
                  <span className="font-bold text-foreground">{Number(order.totalAmount).toFixed(2)} د.ل</span>
                </div>
              </div>

              <Link href="/">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                  {t('confirmation.back_to_home')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
}
