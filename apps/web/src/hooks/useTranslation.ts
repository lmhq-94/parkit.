"use client";

import { useLocaleStore } from "@/lib/store";
import { t, translateEnum } from "@/lib/i18n";

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  return {
    locale,
    t: (key: string) => t(locale, key),
    tEnum: (enumKey: string, value: string | null | undefined) =>
      translateEnum(locale, enumKey, value),
  };
}
