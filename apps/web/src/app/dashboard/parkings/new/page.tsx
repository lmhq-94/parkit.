"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Hash, Tag, Navigation, Radius, ChevronDown, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-text-muted";
const SL = "w-full pl-10 pr-9 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 appearance-none";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

const PARKING_TYPES = ["OPEN", "COVERED", "TOWER", "UNDERGROUND", "ELEVATOR"] as const;

const defaultForm = {
  name: "", address: "", type: "OPEN", totalSlots: "",
  requiresBooking: false, latitude: "", longitude: "", geofenceRadius: "50",
};

export default function NewParkingPage() {
  const { t, tEnum } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    const totalSlots = Number(form.totalSlots);
    if (!form.name.trim() || !form.address.trim() || !form.type || !Number.isFinite(totalSlots) || totalSlots <= 0) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.post("/parkings", {
        name: form.name.trim(), address: form.address.trim(), type: form.type, totalSlots,
        requiresBooking: form.requiresBooking,
        latitude: form.latitude !== "" ? Number(form.latitude) : undefined,
        longitude: form.longitude !== "" ? Number(form.longitude) : undefined,
        geofenceRadius: form.geofenceRadius !== "" ? Number(form.geofenceRadius) : undefined,
      });
      router.push("/dashboard/parkings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el estacionamiento");
    } finally { setSubmitting(false); }
  };

  const n = Number(form.totalSlots);
  const isValid = form.name.trim() && form.address.trim() && form.type && form.totalSlots !== "" && Number.isFinite(n) && n > 0;

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Sección — información */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500/8 to-transparent flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0">
            <MapPin className="w-4.5 h-4.5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("parkings.sectionMain")}</p>
            <p className="text-xs text-text-muted">{t("parkings.sectionMainDesc")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">{t("common.requiredBadge")}</span>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={LABEL}>{t("parkings.name")} <span className="text-sky-500">*</span></label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input value={form.name} onChange={set("name")} placeholder="Parqueo Central" className={IL} />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={LABEL}>{t("parkings.address")} <span className="text-sky-500">*</span></label>
              <div className="relative group">
                <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input value={form.address} onChange={set("address")} placeholder="Calle 0, Avenida 0, San José" className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("parkings.type")} <span className="text-sky-500">*</span></label>
              <div className="relative group">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <select value={form.type} onChange={set("type")} className={SL}>
                  {PARKING_TYPES.map(pt => <option key={pt} value={pt}>{tEnum("parkingType", pt)}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("parkings.totalSlots")} <span className="text-sky-500">*</span></label>
              <div className="relative group">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input type="number" min={1} value={form.totalSlots} onChange={set("totalSlots")} placeholder="50" className={IL} />
              </div>
            </div>
            <div className="flex items-center gap-4 pt-1 sm:pt-7">
              <button
                type="button" role="switch" aria-checked={form.requiresBooking}
                onClick={() => setForm(p => ({ ...p, requiresBooking: !p.requiresBooking }))}
                className={`relative w-11 h-6 rounded-full shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-page ${form.requiresBooking ? "bg-sky-500" : "bg-input-border"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${form.requiresBooking ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-text-secondary">{t("parkings.requiresBooking")}</p>
                <p className="text-xs text-text-muted">{form.requiresBooking ? t("parkings.requiresBookingOn") : t("parkings.requiresBookingOff")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección — geolocalización */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/8 to-transparent flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Navigation className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("parkings.sectionGeo")}</p>
            <p className="text-xs text-text-muted">{t("parkings.sectionGeoDesc")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-text-muted/60 bg-input-bg px-2.5 py-1 rounded-full border border-input-border/60">{t("common.optionalBadge")}</span>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("parkings.latitude")}</label>
              <div className="relative group">
                <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input type="number" step="any" value={form.latitude} onChange={set("latitude")} placeholder="9.9281" className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("parkings.longitude")}</label>
              <div className="relative group">
                <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input type="number" step="any" value={form.longitude} onChange={set("longitude")} placeholder="-84.0907" className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("parkings.geofenceRadius")}</label>
              <div className="relative group">
                <Radius className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input type="number" min={1} value={form.geofenceRadius} onChange={set("geofenceRadius")} placeholder="50" className={IL} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/parkings"
            className="px-5 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors">
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={handleSubmit} disabled={submitting || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("parkings.creating")}</> : <>{t("parkings.createParking")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
