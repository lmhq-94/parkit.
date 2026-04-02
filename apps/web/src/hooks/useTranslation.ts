"use client";

import { useCallback, useMemo } from "react";
import { useLocaleStore } from "@/lib/store";
import { t, tWithCompany, translateEnum } from "@/lib/i18n";

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const tFn = useCallback(
    (key: string, vars?: Record<string, string | number>) => t(locale, key, vars),
    [locale]
  );
  const tWithCompanyFn = useCallback(
    (key: string, companyName: string | null) => tWithCompany(locale, key, companyName),
    [locale]
  );
  const tEnumFn = useCallback(
    (enumKey: string, value: string | null | undefined) => translateEnum(locale, enumKey, value),
    [locale]
  );
  return useMemo(
    () => ({ locale, t: tFn, tWithCompany: tWithCompanyFn, tEnum: tEnumFn }),
    [locale, tFn, tWithCompanyFn, tEnumFn]
  );
}
