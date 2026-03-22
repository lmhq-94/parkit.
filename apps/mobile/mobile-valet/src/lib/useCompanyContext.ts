import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { useCompanyStore } from "@/lib/companyStore";
import type { User } from "@/lib/auth";

/**
 * Resuelve empresa para APIs que usan `requireCompany` (valets sin company en el token).
 */
export function useCompanyContext(user: User | null) {
  const setCompanyId = useCompanyStore((s) => s.setCompanyId);
  const companyId = useCompanyStore((s) => s.companyId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    if (!user) {
      setCompanyId(null);
      return;
    }
    if (user.companyId) {
      setCompanyId(user.companyId);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const meRes = await api.get<{
        data: { companyId?: string | null };
      }>("/valets/me");
      const fromMe = meRes.data?.data?.companyId;
      if (fromMe) {
        setCompanyId(fromMe);
        return;
      }
      const asgRes = await api.get<{
        data: Array<{ ticket?: { companyId?: string } }>;
      }>("/valets/me/assignments");
      const list = Array.isArray(asgRes.data?.data) ? asgRes.data.data : [];
      const fromTicket = list.find((a) => a.ticket?.companyId)?.ticket?.companyId;
      if (fromTicket) {
        setCompanyId(fromTicket);
        return;
      }
      setCompanyId(null);
      setError("no_company");
    } catch {
      setCompanyId(null);
      setError("network");
    } finally {
      setLoading(false);
    }
  }, [user, setCompanyId]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return { companyId, loading, error, refresh: hydrate };
}
