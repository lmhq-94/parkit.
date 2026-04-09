"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";
import { useLocaleStore } from "@/lib/store";
import { getStoredLocale, detectDeviceLocale } from "@/lib/i18n";
import { CompanyThemeSync } from "@/components/CompanyThemeSync";
import { Toaster } from "@/components/Toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  const setLocale = useLocaleStore((s) => s.setLocale);

  useEffect(() => {
    const stored = getStoredLocale();
    // If no stored locale, detect from device; otherwise use stored
    const locale = stored || detectDeviceLocale();
    setLocale(locale);
  }, [setLocale]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="parkit_theme"
      disableTransitionOnChange={false}
    >
      <CompanyThemeSync />
      {children}
      <Toaster />
    </NextThemesProvider>
  );
}
