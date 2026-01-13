import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { trpc } from "@/lib/trpc";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const { data: settings } = trpc.storeSettings.get.useQuery(undefined, {
    // Remove staleTime to ensure immediate updates when settings change
    refetchOnWindowFocus: true,
  });

  const prevTemplateRef = useRef<string | undefined>(undefined);

  // Sync theme state with Server Template changes
  useEffect(() => {
    const serverTemplate = settings?.theme?.template;

    if (!serverTemplate) return;

    // If prevTemplateRef is undefined, it means this is the first load of settings.
    if (prevTemplateRef.current === undefined) {
      prevTemplateRef.current = serverTemplate;

      // On first load, if we have a stored theme from localStorage, KEEP IT (User Preference wins).
      // ONLY if there is NO stored theme, we apply the server default.
      const storedTheme = localStorage.getItem("theme");
      if (!storedTheme) {
        if (serverTemplate === 'dark') {
          setTheme('dark');
        } else {
          setTheme('light');
        }
      }
      return;
    }

    // Subsequent updates: If server template CHANGED (Admin updated settings while user is browsing),
    // we might want to respect that OR ignore it. Usually apps respect user preference.
    // But let's assume if context changes drastically, we update.
    // For now, let's only update if it actually changed and maybe prompt or force update.

    if (serverTemplate !== prevTemplateRef.current) {
      if (serverTemplate === 'dark') {
        setTheme('dark');
      } else {
        setTheme('light');
      }
      prevTemplateRef.current = serverTemplate;
    }
  }, [settings?.theme?.template]);

  // Apply Theme Class and Variables
  useEffect(() => {
    const root = document.documentElement;

    // Helper function to determine if a color is light or dark
    const isLightColor = (hexColor: string): boolean => {
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 155;
    };

    // Apply Class
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply Dynamic Colors with proper foreground calculation
    // Apply Dynamic Colors
    const themeSettings = settings?.theme;
    if (themeSettings) {

      // 1. Primary Color (Applies to BOTH modes)
      if (themeSettings.primaryColor) {
        root.style.setProperty('--primary', themeSettings.primaryColor);
        const primaryFg = isLightColor(themeSettings.primaryColor) ? '#000000' : '#ffffff';
        root.style.setProperty('--primary-foreground', primaryFg);
      }

      // 2. Mode Logic
      if (theme === 'light') {
        // --- LIGHT MODE: Use Admin Panel Settings ---
        // The user configures their brand colors in the admin panel for the main (light) view.

        // Background
        root.style.setProperty('--background', themeSettings.backgroundColor || '#ffffff');

        // Text
        root.style.setProperty('--foreground', themeSettings.textColor || '#0f172a');
        root.style.setProperty('--card-foreground', themeSettings.textColor || '#0f172a');
        root.style.setProperty('--secondary-foreground', themeSettings.textColor || '#0f172a');
        root.style.setProperty('--popover-foreground', themeSettings.textColor || '#0f172a');

        // Secondary
        root.style.setProperty('--secondary', themeSettings.secondaryColor || '#ffffff');
        root.style.setProperty('--card', themeSettings.secondaryColor || '#ffffff');
        root.style.setProperty('--popover', themeSettings.secondaryColor || '#ffffff');

      } else {
        // --- DARK MODE: Fixed Dark Theme (Overrides Admin Settings) ---
        // We ignore admin background/text settings here to prevent a "White Background" setting 
        // from blinding the user in Dark Mode.

        const darkBg = '#09090b'; // Zinc 950
        const darkCard = '#18181b'; // Zinc 900
        const darkText = '#fafafa'; // Zinc 50

        // Background
        root.style.setProperty('--background', darkBg);

        // Text
        root.style.setProperty('--foreground', darkText);
        root.style.setProperty('--card-foreground', darkText);
        root.style.setProperty('--secondary-foreground', darkText);
        root.style.setProperty('--popover-foreground', darkText);

        // Secondary / Cards
        // For Dark Mode, we can check if the user set a DARK secondary color. 
        // If they set a light one (like white), we force dark.
        // But to be safe and consistent, let's use a standard dark card color.
        root.style.setProperty('--secondary', darkCard);
        root.style.setProperty('--card', darkCard);
        root.style.setProperty('--popover', darkCard);
      }

      // Header and Footer (Apply if set)
      if (themeSettings.headerColor) root.style.setProperty('--header-bg', themeSettings.headerColor);
      if (themeSettings.footerColor) root.style.setProperty('--footer-bg', themeSettings.footerColor);

      // Border Radius
      if (themeSettings.buttonRadius) root.style.setProperty('--radius', themeSettings.buttonRadius);
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable, settings]);

  const toggleTheme = switchable
    ? () => {
      setTheme(prev => (prev === "light" ? "dark" : "light"));
    }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

