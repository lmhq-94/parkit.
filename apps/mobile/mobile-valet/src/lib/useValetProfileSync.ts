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
        const res = await api.get<{
          data: {
            staffRole: string | null;
            currentStatus?: string | null;
          };
        }>("/valets/me");
        const row = res.data?.data;
        const sr = (row?.staffRole ?? null) as User["valetStaffRole"];
        const rawSt = row?.currentStatus;
        const st: User["valetCurrentStatus"] | null =
          rawSt === "AVAILABLE" || rawSt === "BUSY" || rawSt === "AWAY" ? rawSt : null;
        if (cancelled) return;
        const currentRole = user.valetStaffRole ?? null;
        const currentStatus = user.valetCurrentStatus ?? null;
        if (sr !== currentRole || st !== currentStatus) {
          mergeUser({ valetStaffRole: sr, valetCurrentStatus: st });
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
