import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";
import api from "@/lib/api";

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

function haversineKm(
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

/**
 * Parqueo más cercano entre **todos** los parqueos con coordenadas del sistema
 * (valets rotan entre empresas; no depende de X-Company-Id).
 */
export function useNearestParking(enabled: boolean) {
  const [nearest, setNearest] = useState<NearestParkingResult | null>(null);
  const [status, setStatus] = useState<LocationUiState>("idle");

  const refresh = useCallback(async () => {
    if (!enabled) {
      setNearest(null);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    setNearest(null);
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== "granted") {
        setStatus("denied");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const res = await api.get<{ data: ParkingWithCoords[] }>(
        "/parkings/valet/all-locations"
      );
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const withCoords = list.filter(
        (p) =>
          p.latitude != null &&
          p.longitude != null &&
          !Number.isNaN(p.latitude) &&
          !Number.isNaN(p.longitude)
      );
      if (withCoords.length === 0) {
        setStatus("unavailable");
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
      setStatus("unavailable");
      setNearest(null);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { nearest, status, refresh };
}
