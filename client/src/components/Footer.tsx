import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import SocialMediaLinks from "./SocialMediaLinks";
import { useTranslation } from "react-i18next";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Footer() {
    const { t } = useTranslation();
    const { data: settings } = trpc.storeSettings.get.useQuery();

    const currentYear = new Date().getFullYear();
    const defaultCopyright = `© ${currentYear} ${settings?.storeName || 'SABO STORE'}. ${t('footer.all_rights_reserved')}`;

    return (
        <footer
            className="bg-muted text-foreground py-12 overflow-x-hidden border-t border-border transition-colors duration-300"
            style={{ backgroundColor: settings?.theme?.footerColor || undefined }}
        >
            <div className="container mx-auto px-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* About Section */}
                    <div className="min-w-0">
                        <h4 className="font-bold text-lg mb-6 text-foreground">
                            {t('footer.about')} {settings?.storeName || 'SABO STORE'}
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {settings?.footer?.aboutText || t('footer.about_text')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="min-w-0">
                        <h4 className="font-bold text-lg mb-6 text-foreground">{t('footer.quick_links')}</h4>
                        <ul className="text-muted-foreground text-sm space-y-3">
                            {settings?.footer?.quickLinks && settings.footer.quickLinks.length > 0 ? (
                                settings.footer.quickLinks.map((link, index) => (
                                    <li key={index}>
                                        <Link href={link.url} className="hover:text-primary transition-colors flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li>
                                        <Link href="/products" className="hover:text-primary transition-colors flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                            {t('common.products_title')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/cart" className="hover:text-primary transition-colors flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                            {t('nav.cart')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/my-orders" className="hover:text-primary transition-colors flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                            {t('nav.my_orders')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/admin/login" className="hover:text-primary transition-colors flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                            {t('nav.dashboard')}
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="min-w-0">
                        <h4 className="font-bold text-lg mb-6 text-foreground">{t('footer.contact')}</h4>
                        <ul className="text-muted-foreground text-sm space-y-4">
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>{settings?.footer?.email || "info@sabostore.com"}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span dir="ltr">{settings?.footer?.phone || "+218 9XXXXXXXX"}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Payment & Misc */}
                    <div className="min-w-0">
                        <h4 className="font-bold text-lg mb-6 text-foreground">{t('footer.payment')}</h4>
                        {settings?.footer?.paymentText && <p className="text-muted-foreground text-sm mb-4">{settings.footer.paymentText}</p>}

                        <TooltipProvider>
                            <div className="flex gap-6 mb-8 flex-wrap items-center">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <img
                                            src="/cash-payment.png"
                                            alt={t('checkout_page.cod')}
                                            className="h-16 w-auto object-contain cursor-help transition-transform duration-300 hover:scale-110"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('checkout_page.cod')}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <img
                                            src="/moamalat.png"
                                            alt="Moamalat"
                                            className="h-16 w-auto object-contain cursor-help transition-transform duration-300 hover:scale-110"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Moamalat</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <img
                                            src="/lypay.png"
                                            alt="LYPAY"
                                            className="h-16 w-auto object-contain cursor-help transition-transform duration-300 hover:scale-110"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>LYPAY</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            <h4 className="font-bold text-lg mb-6 text-foreground">{t('footer.supported_delivery')}</h4>
                            <div className="flex gap-6 flex-wrap items-center">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <img
                                            src="/vanex-logo.png"
                                            alt="Vanex"
                                            className="h-20 w-auto object-contain cursor-help transition-transform duration-300 hover:scale-110 mix-blend-multiply"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Vanex Delivery</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <img
                                            src="/darb-sabil-logo.png"
                                            alt="Darb Al-Sabil"
                                            className="h-20 w-auto object-contain cursor-help transition-transform duration-300 hover:scale-110 mix-blend-multiply"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Darb Al-Sabil</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Social Media & Copyright */}
                <div className="pt-8 border-t border-border">
                    <div className="flex flex-col items-center gap-6">
                        <SocialMediaLinks />

                        <p className="text-muted-foreground text-sm text-center">
                            {settings?.footer?.copyright || defaultCopyright}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
