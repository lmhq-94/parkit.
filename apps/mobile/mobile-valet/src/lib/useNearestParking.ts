import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";
import api from "@/lib/api";
import { useOnAppForeground } from "@/lib/useOnAppForeground";
import { PARKINGS_POLL_MS } from "@/lib/syncConstants";

export interface ParkingWithCoords {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  companyId: string;
  company?: {
    commercialName: string | null;
    legalName: string | null;
  } | null;
}

export interface NearestParkingResult {
  parking: ParkingWithCoords;
  distanceKm: number;
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type LocationUiState = "idle" | "loading" | "denied" | "unavailable" | "ready";

export type RefreshParkingsOptions = { silent?: boolean };

/**
 * Lista de parqueos + el más cercano si hay ubicación.
 * Refresco silencioso periódico y al volver a la app / pantalla inicio para reflejar cambios desde web.
 */
export function useNearestParking(enabled: boolean) {
  const [nearest, setNearest] = useState<NearestParkingResult | null>(null);
  const [allParkings, setAllParkings] = useState<ParkingWithCoords[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [status, setStatus] = useState<LocationUiState>("idle");

  const refresh = useCallback(
    async (opts?: RefreshParkingsOptions) => {
      const silent = opts?.silent === true;
      if (!enabled) {
        setNearest(null);
        setAllParkings([]);
        setUserCoords(null);
        setStatus("idle");
        return;
      }
      if (!silent) {
        setStatus("loading");
        setNearest(null);
      }
      try {
        const res = await api.get<{ data: ParkingWithCoords[] }>("/parkings/valet/all-locations");
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setAllParkings(list);

        if (list.length === 0) {
          setUserCoords(null);
          setNearest(null);
          setStatus("unavailable");
          return;
        }

        const withCoords = list.filter(
          (p) =>
            p.latitude != null &&
            p.longitude != null &&
            !Number.isNaN(p.latitude) &&
            !Number.isNaN(p.longitude)
        );

        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm !== "granted") {
          setUserCoords(null);
          setNearest(null);
          setStatus("denied");
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserCoords({ lat, lon });

        if (withCoords.length === 0) {
          setNearest(null);
          setStatus("ready");
          return;
        }

        let best: NearestParkingResult | null = null;
        for (const p of withCoords) {
          const d = haversineKm(lat, lon, p.latitude!, p.longitude!);
          if (!best || d < best.distanceKm) {
            best = { parking: p, distanceKm: d };
          }
        }
        setNearest(best);
        setStatus("ready");
      } catch {
        if (!silent) {
          setAllParkings([]);
          setUserCoords(null);
          setNearest(null);
          setStatus("unavailable");
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      void refresh({ silent: true });
    }, PARKINGS_POLL_MS);
    return () => clearInterval(id);
  }, [enabled, refresh]);

  useOnAppForeground(() => {
    if (enabled) void refresh({ silent: true });
  });

  return { nearest, status, refresh, allParkings, userCoords };
}
