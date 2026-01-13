import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

export default function StoreInitializer() {
    const { data: settings } = trpc.storeSettings.get.useQuery();

    useEffect(() => {
        if (!settings) return;

        // تحديث عنوان الصفحة (إذا كان في الصفحة الرئيسية أو لم يتم تعيينه)
        if (settings.storeName && (document.title === "Vite App" || document.title === "SABO STORE")) {
            document.title = settings.storeName;
        }

        // تحديث أيقونة المتصفح (Favicon)
        if (settings.favicon) {
            const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = settings.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [settings]);

    return null;
}
