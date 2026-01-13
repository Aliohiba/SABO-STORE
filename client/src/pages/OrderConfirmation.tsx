import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, Home, Loader2, CreditCard } from "lucide-react";
import CustomerNavbar from "@/components/CustomerNavbar";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";


export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();

  // Fetch order details to show payment status
  const { data: order, isLoading } = trpc.orders.getById.useQuery(
    { id: orderId },
    { enabled: !!orderId, refetchInterval: 5000 } // Refetch every 5s to catch status updates
  );



  return (
    <div className="min-h-screen bg-background">
      <CustomerNavbar showSearch={false} />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-card rounded-lg p-8 text-center shadow-sm border border-border">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />

          <h1 className="text-3xl font-bold mb-2 text-card-foreground">شكراً لك!</h1>
          <p className="text-muted-foreground mb-6">تم استقبال طلبك بنجاح</p>

          <div className="bg-muted/50 p-6 rounded-xl mb-6 relative overflow-hidden ring-1 ring-border">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">رقم الطلب</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-card-foreground">{order?.trackingKey || `#${orderId}`}</span>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center pt-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* LYPAY Payment Section */}
                  {order && order.paymentMethod === 'lypay' && !order.isPaid && (
                    <div className="flex flex-col items-center gap-4 pt-4 border-t border-border mt-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="text-center space-y-4 w-full">
                        <div className="grid gap-3">
                          <div className="bg-card px-4 py-3 rounded border border-dashed border-border">
                            <p className="text-xs text-muted-foreground mb-1">رقم الحساب (IBAN) 1</p>
                            <p dir="ltr" className="font-mono text-sm font-bold text-card-foreground select-all">
                              LY830070140140111532620
                            </p>
                          </div>
                          <div className="bg-card px-4 py-3 rounded border border-dashed border-border">
                            <p className="text-xs text-muted-foreground mb-1">رقم الحساب (IBAN) 2</p>
                            <p dir="ltr" className="font-mono text-sm font-bold text-card-foreground select-all">
                              LY57024007010098447020701
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-card-foreground mb-1">بيانات الدفع (لي باي/تداول)</p>
                          <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                            يرجى إتمام عملية الدفع إلى أحد الحسابات الموضحة أعلاه. سيتم تحديث حالة الطلب تلقائياً عند التأكيد من قبل الإدارة.
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 animate-pulse mt-2">
                        في انتظار تأكيد الدفع...
                      </Badge>
                    </div>
                  )}

                  {/* Payment Status for LYPAY (Paid) */}
                  {order && order.paymentMethod === 'lypay' && order.isPaid && (
                    <div className="flex flex-col items-center gap-2 pt-2 border-t border-border mt-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 px-3 py-1 text-sm gap-1.5 shadow-none">
                        <CheckCircle className="w-3.5 h-3.5 fill-current" />
                        تم الدفع عبر لي باي
                      </Badge>
                    </div>
                  )}

                  {/* Payment Status (Moamalat / Other) */}
                  {order && (order.isPaid || order.paymentMethod === 'moamalat') && order.paymentMethod !== 'lypay' && (
                    <div className="flex flex-col items-center gap-2 pt-2 border-t border-border mt-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {order.isPaid ? (
                        <>
                          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 px-3 py-1 text-sm gap-1.5 shadow-none">
                            <CheckCircle className="w-3.5 h-3.5 fill-current" />
                            تم الدفع بنجاح
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {order.paymentMethod === 'wallet' ? 'تم الخصم من المحفظة' : 'تم استلام المبلغ عبر معاملات'}
                          </p>
                        </>
                      ) : (
                        // If selected moamalat but not confirmed yet
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200 animate-pulse">
                            جاري التحقق من الدفع...
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* COD Status */}
                  {order && order.paymentMethod !== 'moamalat' && order.paymentMethod !== 'lypay' && !order.isPaid && (
                    <div className="pt-2 border-t border-border mt-3">
                      <Badge variant="outline" className="text-muted-foreground border-border">
                        الدفع عند الاستلام
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <p className="text-muted-foreground mb-6 text-sm">
            سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن. يمكنك تتبع حالة طلبك باستخدام رقم الطلب.
          </p>

          <div className="space-y-3">
            <Link href={`/track/${order?.trackingKey || orderId}`}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                تتبع حالة الطلب
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full gap-2 hover:bg-muted">
                <Home className="h-4 w-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
