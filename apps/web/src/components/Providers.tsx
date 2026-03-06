"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";
import { useLocaleStore } from "@/lib/store";
import { getStoredLocale } from "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  const setLocale = useLocaleStore((s) => s.setLocale);

  useEffect(() => {
    const stored = getStoredLocale();
    setLocale(stored);
  }, [setLocale]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="parkit_theme"
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
