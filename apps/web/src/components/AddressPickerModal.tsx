"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslation } from "@/hooks/useTranslation";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "Parkit/1.0 (address picker)";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
}

export interface AddressPickerCoords {
  lat: number;
  lon: number;
}

interface AddressPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (address: string, coords?: AddressPickerCoords, geofenceRadius?: number) => void;
  initialValue?: string;
  countryCode?: string;
  /** Si se define, se muestra el campo "Radio de geovalla" y se devuelve en onSelect. */
  initialGeofenceRadius?: number;
}

async function searchAddress(
  query: string,
  countryCode?: string
): Promise<NominatimResult[]> {
  if (!query.trim() || query.length < 3) return [];
  const params = new URLSearchParams({
    q: query.trim(),
    format: "json",
    addressdetails: "1",
    limit: "6",
  });
  if (countryCode && countryCode.length === 2) params.set("countrycodes", countryCode);
  const res = await fetch(`${NOMINATIM_BASE}/search?${params.toString()}`, {
    headers: { "Accept-Language": "es,en", "User-Agent": USER_AGENT },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimResult[];
  return Array.isArray(data) ? data : [];
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "json",
  });
  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params.toString()}`, {
    headers: { "Accept-Language": "es,en", "User-Agent": USER_AGENT },
  });
  if (!res.ok) return "";
  const data = (await res.json()) as { display_name?: string };
  return data?.display_name ?? "";
}

const FALLBACK_LAT = 9.9281;
const FALLBACK_LON = -84.0907;

// Mapa Leaflet cargado solo en cliente para evitar SSR
const PickerMap = dynamic(
  () =>
    import("@/components/AddressPickerMap").then((m) => m.AddressPickerMap),
  { ssr: false, loading: () => <div className="h-[220px] bg-input-bg rounded-lg animate-pulse" style={{ height: 220 }} /> }
);

export function AddressPickerModal({
  open,
  onClose,
  onSelect,
  initialValue = "",
  countryCode,
  initialGeofenceRadius,
}: AddressPickerModalProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState(initialValue);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<NominatimResult | null>(null);
  const [defaultCenter, setDefaultCenter] = useState<{ lat: number; lon: number }>({ lat: FALLBACK_LAT, lon: FALLBACK_LON });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showNoResultsHint, setShowNoResultsHint] = useState(false);
  const showGeofence = initialGeofenceRadius != null;
  const [geofenceRadius, setGeofenceRadius] = useState(() =>
    Math.min(150, Math.max(10, initialGeofenceRadius ?? 50))
  );

  useEffect(() => {
    if (!open) return;
    setShowNoResultsHint(false);
    setSearchValue(initialValue);
    setResults([]);
    setSelected(null);
    setGeofenceRadius(Math.min(150, Math.max(10, initialGeofenceRadius ?? 50)));
    setDefaultCenter({ lat: FALLBACK_LAT, lon: FALLBACK_LON });
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDefaultCenter({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => { /* mantiene fallback */ },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, [open, initialValue, initialGeofenceRadius]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchValue.trim().length < 3) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setShowNoResultsHint(false);
      searchAddress(searchValue, countryCode)
        .then((list) => {
          setResults(list);
          setLoading(false);
          setShowNoResultsHint(list.length === 0);
        })
        .catch(() => {
          setResults([]);
          setLoading(false);
          setShowNoResultsHint(true);
        });
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [open, searchValue, countryCode]);

  const handleSelectResult = (result: NominatimResult) => {
    setSelected(result);
    setSearchValue(result.display_name);
    setResults([]);
  };

  const handleMapClick = useCallback((lat: number, lon: number) => {
    reverseGeocode(lat, lon).then((addr) => {
      if (addr) {
        setSearchValue(addr);
        setSelected({ place_id: 0, display_name: addr, lat: String(lat), lon: String(lon) });
      }
    });
  }, []);

  const handleUseAddress = () => {
    const toUse = selected?.display_name ?? searchValue.trim();
    if (toUse) {
      const coords = selected
        ? { lat: parseFloat(selected.lat), lon: parseFloat(selected.lon) }
        : undefined;
      const radius = showGeofence ? Math.max(1, Math.min(9999, geofenceRadius)) : undefined;
      onSelect(toUse, coords, radius);
    }
    onClose();
  };

  if (!open || typeof document === "undefined") return null;

  const content = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-picker-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-label={t("common.close")}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-card-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border shrink-0">
          <h2 id="address-picker-title" className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <MapPin className="w-4 h-4 text-company-primary" />
            {t("companies.addressPickerTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-input-bg transition-colors"
            aria-label={t("common.close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setSelected(null);
              }}
              placeholder={t("companies.addressPickerSearchPlaceholder")}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary"
              autoFocus
            />
            {loading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">...</span>
            )}
          </div>

          {results.length > 0 && (
            <ul className="border border-input-border rounded-lg overflow-hidden divide-y divide-card-border max-h-40 overflow-y-auto">
              {results.map((r) => (
                <li key={r.place_id}>
                  <button
                    type="button"
                    onClick={() => handleSelectResult(r)}
                    className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-input-bg transition-colors"
                  >
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selected && (
            <p className="text-xs text-text-muted">
              {t("companies.selected")}: <span className="text-text-secondary font-medium">{selected.display_name}</span>
            </p>
          )}

          <div className="space-y-1">
            <PickerMap
              lat={selected ? parseFloat(selected.lat) : defaultCenter.lat}
              lon={selected ? parseFloat(selected.lon) : defaultCenter.lon}
              showMarker={!!selected}
              geofenceRadius={showGeofence && selected ? geofenceRadius : undefined}
              onMapClick={handleMapClick}
            />
            <p className="text-xs text-text-muted">
              {selected ? t("companies.addressPickerClickToChange") : t("companies.addressPickerClickToSelect")}
            </p>
          </div>

          {showGeofence && selected && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-text-secondary">
                  {t("parkings.geofenceRadius")}
                </label>
                <span className="text-sm font-medium text-text-primary tabular-nums">{geofenceRadius} m</span>
              </div>
              <input
                type="range"
                min={10}
                max={150}
                step={10}
                value={Math.min(150, Math.max(10, geofenceRadius))}
                onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                className="address-picker-geofence-slider w-full"
              />
            </div>
          )}

          {!selected && searchValue.trim().length >= 3 && !loading && showNoResultsHint && (
            <p className="text-sm text-text-muted">{t("companies.addressPickerHint")}</p>
          )}
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-card-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleUseAddress}
            disabled={!searchValue.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg border border-company-primary-muted bg-company-primary-subtle text-sm font-medium text-company-primary hover:bg-company-primary-subtle transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {t("companies.useThisAddress")}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
