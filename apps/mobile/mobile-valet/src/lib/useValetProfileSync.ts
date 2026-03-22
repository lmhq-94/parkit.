import { useCallback, useEffect, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "@/lib/store";
import { saveUser } from "@/lib/auth";
import api from "@/lib/api";
import type { User } from "@/lib/auth";

const POLL_MS = 25_000;

async function pullValetMe(user: User, mergeUser: (p: Partial<User>) => void) {
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
}

/**
 * Mantiene `valetStaffRole` y `valetCurrentStatus` alineados con GET /valets/me.
 * Refresco al enfocar la pantalla, cada ~25s en segundo plano, y cuando cambia el usuario.
 */
export function useValetProfileSync(user: User | null) {
  const mergeUser = useAuthStore((s) => s.mergeUser);
  const userRef = useRef(user);
  userRef.current = user;

  const sync = useCallback(() => {
    const u = userRef.current;
    if (!u || u.systemRole !== "STAFF") return;
    void pullValetMe(u, mergeUser);
  }, [mergeUser]);

  useEffect(() => {
    if (!user || user.systemRole !== "STAFF") return;
    let cancelled = false;
    void pullValetMe(user, mergeUser);
    const id = setInterval(() => {
      if (!cancelled) sync();
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user, mergeUser, sync]);

  useFocusEffect(
    useCallback(() => {
      sync();
    }, [sync])
  );
}
