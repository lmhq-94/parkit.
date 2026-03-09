"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
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

export function AddressPickerMap({ lat, lon, showMarker = true, onMapClick }: AddressPickerMapProps) {
  const center: [number, number] = [lat, lon];

  return (
    <div
      className="w-full rounded-lg overflow-hidden border border-input-border bg-input-bg"
      style={{ height: MAP_HEIGHT }}
    >
      <MapContainer
        center={center}
        zoom={16}
        className="h-full w-full"
        style={{ height: MAP_HEIGHT }}
        scrollWheelZoom
      >
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_URL} />
        {showMarker && <Marker position={center} icon={defaultIcon} />}
        <SetCenter lat={lat} lon={lon} />
        <MapClickHandler onMapClick={onMapClick} />
        <MapResizeFix />
      </MapContainer>
    </div>
  );
}
