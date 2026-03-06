"use client";

import { useLocaleStore } from "@/lib/store";
import { t, tWithCompany, translateEnum } from "@/lib/i18n";

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  return {
    locale,
    t: (key: string) => t(locale, key),
    tWithCompany: (key: string, companyName: string | null) =>
      tWithCompany(locale, key, companyName),
    tEnum: (enumKey: string, value: string | null | undefined) =>
      translateEnum(locale, enumKey, value),
  };
}
