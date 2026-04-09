"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { CompanyThemeSync } from "@/components/CompanyThemeSync";
import { Toaster } from "@/components/Toaster";
import { LocaleInit } from "@/components/LocaleInit";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="parkit_theme"
      disableTransitionOnChange={false}
    >
      <CompanyThemeSync />
      <LocaleInit>{children}</LocaleInit>
      <Toaster />
    </NextThemesProvider>
  );
}
