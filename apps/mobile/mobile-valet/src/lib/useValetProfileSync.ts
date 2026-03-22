import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { saveUser } from "@/lib/auth";
import api from "@/lib/api";
import type { User } from "@/lib/auth";

/**
 * Mantiene `valetStaffRole` alineado con GET /valets/me (BD / panel admin).
 * Usar en pantallas donde el rol condiciona la UI (home, tickets, …).
 */
export function useValetProfileSync(user: User | null) {
  const mergeUser = useAuthStore((s) => s.mergeUser);

  useEffect(() => {
    if (!user || user.systemRole !== "STAFF") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{ data: { staffRole: string | null } }>("/valets/me");
        const sr = (res.data?.data?.staffRole ?? null) as User["valetStaffRole"];
        if (cancelled) return;
        const current = user.valetStaffRole ?? null;
        if (sr !== current) {
          mergeUser({ valetStaffRole: sr });
          const next = useAuthStore.getState().user;
          if (next) await saveUser(next);
        }
      } catch {
        // Sin perfil valet o red: no borrar rol local.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, mergeUser]);
}
