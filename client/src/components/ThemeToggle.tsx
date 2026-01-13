import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    // Fetch settings to ensure we have the primary color accurately for the button UI
    const { data: settings } = trpc.storeSettings.get.useQuery();

    // Default blue if nothing loaded yet
    const [primaryColor, setPrimaryColor] = useState('#3b82f6');

    useEffect(() => {
        if (settings?.theme?.primaryColor) {
            setPrimaryColor(settings.theme.primaryColor);
        }
    }, [settings]);

    if (!toggleTheme) return null;

    // Robust function to convert Hex to RGBA for ANY styling needs
    const getTransparentColor = (hex: string, opacity: number) => {
        let c: any;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity + ')';
        }
        return hex; // Fallback
    }

    return (
        <div
            onClick={toggleTheme}
            className={`
                relative w-14 h-7 rounded-full cursor-pointer p-1 transition-all duration-500 border flex items-center shadow-sm select-none
                ${theme === 'dark' ? 'justify-end' : 'justify-start'}
            `}
            style={{
                // Light Mode: Use calculated RGBA for background and border (10% and 30%)
                // Dark Mode: Fixed gray colors
                backgroundColor: theme === 'dark' ? '#18181b' : getTransparentColor(primaryColor, 0.1),
                borderColor: theme === 'dark' ? '#27272a' : getTransparentColor(primaryColor, 0.3)
            }}
            title={theme === 'dark' ? 'تبديل للوضع النهاري' : 'تبديل للوضع الليلي'}
        >
            {/* Icons Decoration */}
            <div className="absolute inset-0 flex justify-between items-center px-2 text-[10px] pointer-events-none overflow-hidden">
                <span className={`transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>✨</span>
                <span className={`transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>☁️</span>
            </div>

            {/* Toggle Circle */}
            <div
                className={`
                    w-5 h-5 rounded-full shadow-md flex items-center justify-center relative z-10 transition-all duration-300
                    ${theme === 'dark' ? 'bg-zinc-950' : 'bg-white'}
                `}
            >
                {theme === 'dark' ? (
                    <Moon
                        className="w-3 h-3 text-primary fill-primary"
                        style={{ color: primaryColor, fill: primaryColor }}
                    />
                ) : (
                    <Sun className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                )}
            </div>
        </div>
    );
}
