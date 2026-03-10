"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

/** OpenStreetMap estándar: azul agua, verde parques, beige calles — colorido en light; en dark se oscurece con CSS. */
const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MAP_HEIGHT = 220;

interface AddressPickerMapProps {
  lat: number;
  lon: number;
  showMarker?: boolean;
  /** Radio de geovalla en metros; si está definido, se dibuja un círculo en el mapa. */
  geofenceRadius?: number;
  onMapClick?: (lat: number, lon: number) => void;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function SetCenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  const prev = useRef({ lat, lon });
  useEffect(() => {
    if (prev.current.lat !== lat || prev.current.lon !== lon) {
      prev.current = { lat, lon };
      map.setView([lat, lon], map.getZoom());
    }
  }, [map, lat, lon]);
  return null;
}

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export function AddressPickerMap({ lat, lon, showMarker = true, geofenceRadius, onMapClick }: AddressPickerMapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const center: [number, number] = [lat, lon];
  const radiusM = geofenceRadius != null && geofenceRadius > 0 ? geofenceRadius : undefined;

  return (
    <div className="w-full space-y-1">
      <div
        className={`w-full rounded-lg overflow-hidden border border-input-border bg-input-bg ${isDark ? "map-dark" : ""}`}
        style={{ height: MAP_HEIGHT }}
      >
        <MapContainer
          center={center}
          zoom={16}
          className="h-full w-full"
          style={{ height: MAP_HEIGHT }}
          scrollWheelZoom
          attributionControl={false}
        >
          <TileLayer url={OSM_URL} />
          {radiusM != null && (
            <Circle
              center={center}
              radius={radiusM}
              pathOptions={{
                color: "var(--company-primary, #2563eb)",
                fillColor: "var(--company-primary, #2563eb)",
                fillOpacity: 0.15,
                weight: 2,
              }}
            />
          )}
          {showMarker && <Marker position={center} icon={defaultIcon} />}
          <SetCenter lat={lat} lon={lon} />
          <MapClickHandler onMapClick={onMapClick} />
          <MapResizeFix />
        </MapContainer>
      </div>
      <p className="text-[10px] text-text-muted" aria-hidden>
        ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-text-secondary"
        >
          OpenStreetMap
        </a>{" "}
        contributors
      </p>
    </div>
  );
}
