"use client";

import { useEffect, useState } from "react";
import { useLocaleStore } from "@/lib/store";
import { getStoredLocale, detectDeviceLocale } from "@/lib/i18n";

/**
 * Este componente inicializa el idioma de forma hidratación-segura.
 * Evita el parpadeo (flicker) al detectar y establecer el idioma
 * antes de que se renderice cualquier contenido traducido.
 */
export function LocaleInit({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    const stored = getStoredLocale();
    const detected = stored || detectDeviceLocale();

    // Si el idioma detectado es diferente al actual, actualizarlo
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
