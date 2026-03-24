import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "@/lib/store";
import { saveUser } from "@/lib/auth";
import api from "@/lib/api";
import type { User } from "@/lib/auth";

const POLL_MS = 30_000;

async function pingValetPresence() {
  try {
    await api.post("/valets/me/ping", {}, { timeout: 12_000 });
  } catch {
    /* sin red o no valet */
  }
}

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

async function syncValetProfile(user: User, mergeUser: (p: Partial<User>) => void) {
  await Promise.all([pullValetMe(user, mergeUser), pingValetPresence()]);
}

/**
 * Mantiene rol/estado con GET /valets/me y presencia con POST /valets/me/ping (latido).
 * Al volver la app a primer plano también envía ping.
 */
export function useValetProfileSync(user: User | null) {
  const mergeUser = useAuthStore((s) => s.mergeUser);
  const userRef = useRef(user);
  userRef.current = user;

  const sync = useCallback(() => {
    const u = userRef.current;
    if (!u || u.systemRole !== "STAFF") return;
    void syncValetProfile(u, mergeUser);
  }, [mergeUser]);

  useEffect(() => {
    if (!user || user.systemRole !== "STAFF") return;
    let cancelled = false;
    void syncValetProfile(user, mergeUser);
    const id = setInterval(() => {
      if (!cancelled) sync();
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user, mergeUser, sync]);

  useEffect(() => {
    if (!user || user.systemRole !== "STAFF") return;
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "active") {
        void pingValetPresence();
      }
    });
    return () => sub.remove();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      sync();
    }, [sync])
  );
}
