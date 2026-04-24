"use client";

import { useEffect, useState } from "react";
import { useLocaleStore } from "@/lib/store";
import { getStoredLocale, detectDeviceLocale } from "@/lib/i18n";

/**
 * This component initializes the language in a hydration-safe way.
 * Prevents flicker by detecting and setting the language
 * before any translated content is rendered.
 */
export function LocaleInit({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  useEffect(() => {
    // Only run on the client
    if (typeof window === "undefined") return;

    const stored = getStoredLocale();
    const detected = stored || detectDeviceLocale();

    // If the detected language is different from the current one, update it
    if (detected !== locale) {
      setLocale(detected);
    }

    // Marcar como listo después de establecer el idioma
    setIsReady(true);
  }, [locale, setLocale]);

  // No renderizar nada hasta que el idioma esté listo
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="w-8 h-8 border-2 border-company-primary/30 border-t-company-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
