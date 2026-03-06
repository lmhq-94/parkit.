"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, Users, Car, MapPin, Calendar, ChevronDown, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-text-muted";
const SL = "w-full pl-10 pr-9 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 appearance-none";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

type ClientOption = { id: string; user?: { firstName?: string; lastName?: string; email?: string } };
type VehicleOption = { id: string; plate?: string; brand?: string; model?: string };
type ParkingOption = { id: string; name?: string };

const defaultForm = { clientId: "", vehicleId: "", parkingId: "", scheduledEntryTime: "", scheduledExitTime: "" };

export default function NewBookingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [parkings, setParkings] = useState<ParkingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, v, p] = await Promise.all([
          apiClient.get<ClientOption[]>("/clients"),
          apiClient.get<VehicleOption[]>("/vehicles"),
          apiClient.get<ParkingOption[]>("/parkings"),
        ]);
        setClients(Array.isArray(c) ? c : []);
        setVehicles(Array.isArray(v) ? v : []);
        setParkings(Array.isArray(p) ? p : []);
      } catch { setClients([]); setVehicles([]); setParkings([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.clientId || !form.vehicleId || !form.parkingId || !form.scheduledEntryTime) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.post("/bookings", {
        clientId: form.clientId, vehicleId: form.vehicleId, parkingId: form.parkingId,
        scheduledEntryTime: new Date(form.scheduledEntryTime).toISOString(),
        ...(form.scheduledExitTime ? { scheduledExitTime: new Date(form.scheduledExitTime).toISOString() } : {}),
      });
      router.push("/dashboard/bookings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la reserva");
    } finally { setSubmitting(false); }
  };

  const isValid = form.clientId && form.vehicleId && form.parkingId && form.scheduledEntryTime;
  const skel = <div className="h-[46px] rounded-lg bg-input-bg border border-input-border animate-pulse" />;

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Sección — detalles de la reserva */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-teal-500/8 to-transparent flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/20 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-4.5 h-4.5 text-teal-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("bookings.sectionMain")}</p>
            <p className="text-xs text-text-muted">{t("bookings.sectionMainDesc")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">{t("common.requiredBadge")}</span>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("bookings.client")} <span className="text-sky-500">*</span></label>
              {loading ? skel : (
                <div className="relative group">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                  <select value={form.clientId} onChange={set("clientId")} className={SL}>
                    <option value="">{t("common.selectPlaceholder")}</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {`${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""}`.trim() || c.user?.email || c.id}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50 pointer-events-none" />
                </div>
              )}
            </div>
            <div>
              <label className={LABEL}>{t("bookings.vehicle")} <span className="text-sky-500">*</span></label>
              {loading ? skel : (
                <div className="relative group">
                  <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                  <select value={form.vehicleId} onChange={set("vehicleId")} className={SL}>
                    <option value="">{t("common.selectPlaceholder")}</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.plate ? `${v.plate} — ${[v.brand, v.model].filter(Boolean).join(" ")}` : v.id}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50 pointer-events-none" />
                </div>
              )}
            </div>
            <div>
              <label className={LABEL}>{t("bookings.parking")} <span className="text-sky-500">*</span></label>
              {loading ? skel : (
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                  <select value={form.parkingId} onChange={set("parkingId")} className={SL}>
                    <option value="">{t("common.selectPlaceholder")}</option>
                    {parkings.map(p => <option key={p.id} value={p.id}>{p.name ?? p.id}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50 pointer-events-none" />
                </div>
              )}
            </div>
            <div>
              <label className={LABEL}>{t("bookings.scheduledEntry")} <span className="text-sky-500">*</span></label>
              <div className="relative group">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input type="datetime-local" value={form.scheduledEntryTime} onChange={set("scheduledEntryTime")} className={IL} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección — horario de salida */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-sky-500/8 to-transparent flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Calendar className="w-4.5 h-4.5 text-sky-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("bookings.sectionExit")}</p>
            <p className="text-xs text-text-muted">{t("bookings.sectionExitDesc")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-text-muted/60 bg-input-bg px-2.5 py-1 rounded-full border border-input-border/60">{t("common.optionalBadge")}</span>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("bookings.scheduledExitOptional")}</label>
              <div className="relative group">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input type="datetime-local" value={form.scheduledExitTime} onChange={set("scheduledExitTime")} className={IL} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/bookings"
            className="px-5 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors">
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={handleSubmit} disabled={submitting || !isValid || loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("bookings.creating")}</> : <>{t("bookings.createBooking")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
