import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Search, ShoppingCart, User, Copy } from "lucide-react";
import CustomerNavbar from "@/components/CustomerNavbar";
import { useTranslation } from "react-i18next";

export default function MyOrders() {
    const { t, i18n } = useTranslation();
    const [, setLocation] = useLocation();

    // Get initial tab from URL
    const getInitialTab = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const tab = searchParams.get("tab");
        if (tab === "wallet" || tab === "profile") return tab;
        return "orders";
    };

    const [activeTab, setActiveTab] = useState<"orders" | "profile" | "wallet" | "support">(getInitialTab());
    const [searchQuery, setSearchQuery] = useState("");
    const { data: customer, isLoading } = trpc.customer.me.useQuery();
    const { data: orders = [] } = trpc.orders.myOrders.useQuery();

    const { data: wallet } = trpc.wallet.getBalance.useQuery(undefined, {
        enabled: activeTab === "wallet"
    });
    const { data: transactionsData } = trpc.wallet.getTransactions.useQuery({}, {
        enabled: activeTab === "wallet"
    });
    const transactions = transactionsData?.transactions || [];

    const { data: mySupportMessages } = trpc.support.myMessages.useQuery(undefined, {
        enabled: activeTab === "support"
    });

    const logout = trpc.customer.logout.useMutation();

    const handleLogout = async () => {
        try {
            await logout.mutateAsync();
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Redirect to login if not authenticated
    if (!isLoading && !customer) {
        setLocation("/login");
        return null;
    }

    if (isLoading || !customer) {
        return (
            <div className="min-h-screen bg-muted flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">{t('my_orders.loading')}</p>
                </div>
            </div>
        );
    }

    // Filter orders based on search query
    const filteredOrders = orders.filter((order: any) =>
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <CustomerNavbar showSearch={false} />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-card rounded-lg shadow-sm p-6 max-w-5xl mx-auto border border-border">
                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-border mb-6 font-headings">
                        <button
                            onClick={() => setActiveTab("orders")}
                            className={`pb-3 px-4 font-medium transition-colors ${activeTab === "orders"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {t('my_orders.title_orders')}
                        </button>
                        <button
                            onClick={() => setActiveTab("wallet")}
                            className={`pb-3 px-4 font-medium transition-colors ${activeTab === "wallet"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {t('wallet.title')}
                        </button>
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`pb-3 px-4 font-medium transition-colors ${activeTab === "profile"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {t('my_orders.title_profile')}
                        </button>
                        <button
                            onClick={() => setActiveTab("support")}
                            className={`pb-3 px-4 font-medium transition-colors ${activeTab === "support"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {t('support.tab_title', 'الدعم الفني')}
                        </button>
                    </div>

                    {/* Orders Tab */}
                    {activeTab === "orders" && (
                        <div>
                            {/* Search Orders */}
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    placeholder={t('my_orders.search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}
                                    dir={i18n.dir()}
                                />
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 shadow-md hover:shadow-primary/20">
                                    {t('my_orders.search_btn')}
                                </Button>
                            </div>

                            {/* Orders Table */}
                            {filteredOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground mb-4">{t('my_orders.no_orders')}</p>
                                    <Link href="/products">
                                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-primary/20">
                                            {t('my_orders.browse_products')}
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-border bg-muted/50">
                                            <tr>
                                                <th className={`py-3 px-4 font-medium text-muted-foreground ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}>{t('my_orders.order_number')}</th>
                                                <th className={`py-3 px-4 font-medium text-muted-foreground ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}>{t('my_orders.order_date')}</th>
                                                <th className={`py-3 px-4 font-medium text-muted-foreground ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}>{t('my_orders.status')}</th>
                                                <th className={`py-3 px-4 font-medium text-muted-foreground ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}>{t('my_orders.amount')}</th>
                                                <th className={`py-3 px-4 font-medium text-muted-foreground ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}>{t('my_orders.paid_status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.map((order: any) => (
                                                <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <Link href={`/track-order/${order._id || order.id}`}>
                                                            <span className="text-primary hover:underline cursor-pointer font-medium hover:text-primary/80">
                                                                {order.orderNumber}
                                                            </span>
                                                        </Link>
                                                    </td>
                                                    <td className="py-3 px-4 text-muted-foreground">
                                                        {new Date(order.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-LY' : 'en-US', {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === "pending"
                                                                ? "bg-yellow-500/10 text-yellow-600 border border-yellow-200"
                                                                : order.status === "confirmed"
                                                                    ? "bg-primary/10 text-primary border border-primary/20"
                                                                    : order.status === "shipped"
                                                                        ? "bg-purple-500/10 text-purple-600 border border-purple-200"
                                                                        : "bg-green-500/10 text-green-600 border border-green-200"
                                                                }`}
                                                        >
                                                            {order.status === "pending" && t('my_orders.status_pending')}
                                                            {order.status === "confirmed" && t('my_orders.status_confirmed')}
                                                            {order.status === "shipped" && t('my_orders.status_shipped')}
                                                            {order.status === "delivered" && t('my_orders.status_delivered')}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-medium text-card-foreground">
                                                        {order.paymentDetails?.walletDeducted ? (
                                                            <div className="flex flex-col">
                                                                <div className="flex items-baseline">
                                                                    <span className="text-sm text-muted-foreground font-normal ml-1">د.ل</span>
                                                                    {parseFloat(order.paymentDetails.remainingAmount || 0).toFixed(2)}
                                                                </div>
                                                                <span className="text-xs text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded mt-0.5 w-fit border border-green-100">
                                                                    -{parseFloat(order.paymentDetails.walletPaid || 0).toFixed(2)} ({t('wallet.title')})
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm text-muted-foreground font-normal mr-1">د.ل</span>
                                                                {parseFloat(order.totalAmount).toFixed(2)}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-muted-foreground">
                                                        {order.paymentStatus === "paid" ? t('my_orders.payment_paid') : t('my_orders.payment_unpaid')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Wallet Tab */}
                    {activeTab === "wallet" && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* Wallet Card */}
                            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl p-8 text-primary-foreground shadow-lg relative overflow-hidden ring-1 ring-white/10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-primary-foreground/90 text-lg font-medium mb-1">{t('wallet.current_balance')}</h3>
                                        {customer?.walletNumber && (
                                            <button
                                                className="bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer group border-0 text-primary-foreground"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(customer.walletNumber);
                                                }}
                                                title="اضغط لنسخ رقم المحفظة"
                                            >
                                                <span className="font-mono text-sm tracking-widest">{customer.walletNumber}</span>
                                                <Copy className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold tracking-tight text-primary-foreground">
                                            {wallet?.balance?.toFixed(2) ?? "0.00"}
                                        </span>
                                        <span className="text-xl opacity-90 text-primary-foreground">د.ل</span>
                                    </div>
                                    <div className="mt-6 flex gap-4">
                                        <Button className="bg-background text-primary hover:bg-background/90 border-0 font-bold shadow-sm">
                                            {t('wallet.add_funds')}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Transactions History */}
                            <div>
                                <h3 className="text-xl font-bold text-card-foreground mb-4 font-headings">{t('wallet.transactions_history')}</h3>
                                <div className="bg-card border border-border rounded-lg overflow-hidden">
                                    {!transactions || transactions.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            {t('wallet.no_transactions')}
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead className="bg-muted/50 border-b border-border">
                                                <tr>
                                                    <th className={`py-3 px-4 font-medium text-muted-foreground ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}>{t('wallet.type')}</th>
                                                    <th className={`py-3 px-4 font-medium text-muted-foreground ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}>{t('wallet.amount')}</th>
                                                    <th className={`py-3 px-4 font-medium text-muted-foreground ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}>{t('wallet.date')}</th>
                                                    <th className={`py-3 px-4 font-medium text-muted-foreground ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}>{t('wallet.status')}</th>
                                                    <th className={`py-3 px-4 font-medium text-muted-foreground ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}>{t('wallet.description')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {transactions.map((tx: any) => (
                                                    <tr key={tx._id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="py-3 px-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-700 border border-green-200' :
                                                                tx.type === 'withdrawal' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                                                                    tx.type === 'payment' ? 'bg-muted text-muted-foreground border border-border' :
                                                                        'bg-primary/10 text-primary border border-primary/20'
                                                                }`}>
                                                                {tx.type === 'deposit' && t('wallet.type_deposit')}
                                                                {tx.type === 'withdrawal' && t('wallet.type_withdrawal')}
                                                                {tx.type === 'payment' && t('wallet.type_payment')}
                                                                {tx.type === 'refund' && t('wallet.type_refund')}
                                                            </span>
                                                        </td>
                                                        <td className={`py-3 px-4 font-medium ${['deposit', 'refund'].includes(tx.type) ? 'text-green-600' : 'text-destructive'
                                                            }`}>
                                                            {['deposit', 'refund'].includes(tx.type) ? '+' : '-'}
                                                            {tx.amount.toFixed(2)} د.ل
                                                        </td>
                                                        <td className="py-3 px-4 text-muted-foreground text-sm">
                                                            {new Date(tx.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-LY' : 'en-US')}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`text-xs ${tx.status === 'completed' ? 'text-green-600' :
                                                                tx.status === 'pending' ? 'text-yellow-600' : 'text-destructive'
                                                                }`}>
                                                                {tx.status === 'completed' ? t('wallet.status_completed') :
                                                                    tx.status === 'pending' ? t('wallet.status_pending') : t('wallet.status_failed')}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-muted-foreground text-sm">
                                                            {tx.description}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-card-foreground mb-4">{t('my_orders.account_info')}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        {t('register.full_name')}
                                    </label>
                                    <input
                                        type="text"
                                        value={customer.name || ""}
                                        readOnly
                                        className="w-full px-4 py-2 border border-border rounded-lg bg-muted/30 focus:outline-none text-card-foreground"
                                        dir="auto"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        {t('register.phone')}
                                    </label>
                                    <input
                                        type="text"
                                        value={customer.phone}
                                        readOnly
                                        className="w-full px-4 py-2 border border-border rounded-lg bg-muted/30 focus:outline-none text-left text-card-foreground"
                                        dir="ltr"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        {t('register.email')}
                                    </label>
                                    <input
                                        type="email"
                                        value={customer.email}
                                        readOnly
                                        className="w-full px-4 py-2 border border-border rounded-lg bg-muted/30 focus:outline-none text-card-foreground"
                                        dir="ltr"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        {t('register.address')}
                                    </label>
                                    <input
                                        type="text"
                                        value={customer.address || "Not specified"} // TODO: Translate fallback?
                                        readOnly
                                        className="w-full px-4 py-2 border border-border rounded-lg bg-muted/30 focus:outline-none text-card-foreground"
                                        dir="auto"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    className="text-destructive border-destructive hover:bg-destructive/10"
                                >
                                    {t('my_orders.logout')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Support Tab */}
                    {activeTab === "support" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-card-foreground">{t('support.my_messages', 'رسائلي')}</h2>
                            </div>

                            {!mySupportMessages || mySupportMessages.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
                                    <p>{t('support.no_messages', 'لا توجد رسائل دعم فني سابقة.')}</p>
                                    <p className="text-sm mt-2 text-muted-foreground/80">{t('support.send_hint', 'يمكنك إرسال رسالة جديدة عبر الرابط في أسفل الموقع.')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {mySupportMessages.map((msg: any) => (
                                        <div key={msg._id} className="border border-border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{msg.subject}</h3>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(msg.createdAt).toLocaleDateString((i18n.language === 'ar' ? 'ar-LY' : 'en-US'), {
                                                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${msg.direction === 'outbound'
                                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                        : msg.status === 'replied'
                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                    }`}>
                                                    {msg.direction === 'outbound'
                                                        ? t('support.status_from_support', 'من الدعم')
                                                        : msg.status === 'replied'
                                                            ? t('support.status_replied', 'تم الرد')
                                                            : t('support.status_pending', 'قيد الانتظار')}
                                                </span>
                                            </div>

                                            <div className="bg-muted/30 p-3 rounded-md mt-2 text-sm text-foreground/90 whitespace-pre-wrap">
                                                {msg.message}
                                            </div>

                                            {msg.reply && (
                                                <div className="mt-4 border-t pt-4 bg-primary/5 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-semibold text-primary">{t('support.admin_reply', 'رد الإدارة:')}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {msg.repliedAt && new Date(msg.repliedAt).toLocaleDateString((i18n.language === 'ar' ? 'ar-LY' : 'en-US'))}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                        {msg.reply}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
