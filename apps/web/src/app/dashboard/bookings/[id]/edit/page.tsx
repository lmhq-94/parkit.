"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Car, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { SelectField } from "@/components/SelectField";
import { DateTimePickerField } from "@/components/DateTimePickerField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { FormPageSkeleton } from "@/components/FormPageSkeleton";

const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

type ClientOption = { id: string; user?: { firstName?: string; lastName?: string; email?: string } };
type VehicleOption = { id: string; plate?: string; brand?: string; model?: string };
type ParkingOption = { id: string; name?: string };

const defaultForm = { clientId: "", vehicleId: "", parkingId: "", scheduledEntryTime: "", scheduledExitTime: "" };

export default function EditBookingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
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
        const [booking, c, v, p] = await Promise.all([
          apiClient.get<Record<string, unknown>>(`/bookings/${id}`),
          apiClient.get<ClientOption[]>("/clients"),
          apiClient.get<VehicleOption[]>("/vehicles"),
          apiClient.get<ParkingOption[]>("/parkings"),
        ]);
        if (booking) {
          setForm({
            clientId: String(booking.clientId ?? ""),
            vehicleId: String(booking.vehicleId ?? ""),
            parkingId: String(booking.parkingId ?? ""),
            scheduledEntryTime: booking.scheduledEntryTime
              ? new Date(String(booking.scheduledEntryTime)).toISOString().slice(0, 16)
              : "",
            scheduledExitTime: booking.scheduledExitTime
              ? new Date(String(booking.scheduledExitTime)).toISOString().slice(0, 16)
              : "",
          });
        }
        setClients(Array.isArray(c) ? c : []);
        setVehicles(Array.isArray(v) ? v : []);
        setParkings(Array.isArray(p) ? p : []);
      } catch {
        setError(t("common.loadingData"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.clientId || !form.vehicleId || !form.parkingId || !form.scheduledEntryTime) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.patch(`/bookings/${id}`, {
        clientId: form.clientId, vehicleId: form.vehicleId, parkingId: form.parkingId,
        scheduledEntryTime: new Date(form.scheduledEntryTime).toISOString(),
        ...(form.scheduledExitTime ? { scheduledExitTime: new Date(form.scheduledExitTime).toISOString() } : {}),
      });
      router.push("/dashboard/bookings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la reserva");
    } finally { setSubmitting(false); }
  };

  const isValid = form.clientId && form.vehicleId && form.parkingId && form.scheduledEntryTime;

  if (loading) return <FormPageSkeleton />;

  const skel = <div className="h-[46px] rounded-lg bg-input-bg border border-input-border animate-pulse" />;

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-teal-500/8 to-transparent">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("bookings.sectionMain")}</p>
            <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">{t("common.requiredBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("bookings.sectionMainDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("bookings.client")} <span className="text-company-primary">*</span></label>
              {clients.length === 0 ? skel : (
                <SelectField value={form.clientId} onChange={set("clientId")} icon={Users}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {`${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""}`.trim() || c.user?.email || c.id}
                    </option>
                  ))}
                </SelectField>
              )}
            </div>
            <div>
              <label className={LABEL}>{t("bookings.vehicle")} <span className="text-company-primary">*</span></label>
              {vehicles.length === 0 ? skel : (
                <SelectField value={form.vehicleId} onChange={set("vehicleId")} icon={Car}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plate ? `${v.plate} — ${[v.brand, v.model].filter(Boolean).join(" ")}` : v.id}
                    </option>
                  ))}
                </SelectField>
              )}
            </div>
            <div>
              <label className={LABEL}>{t("bookings.parking")} <span className="text-company-primary">*</span></label>
              {parkings.length === 0 ? skel : (
                <SelectField value={form.parkingId} onChange={set("parkingId")} icon={MapPin}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {parkings.map(p => <option key={p.id} value={p.id}>{p.name ?? p.id}</option>)}
                </SelectField>
              )}
            </div>
            <div>
              <label className={LABEL}>{t("bookings.scheduledEntry")} <span className="text-company-primary">*</span></label>
              <DateTimePickerField
                value={form.scheduledEntryTime}
                onChange={(v) => setForm((p) => ({ ...p, scheduledEntryTime: v }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-company-primary-8 to-transparent">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("bookings.sectionExit")}</p>
            <span className="text-[10px] font-semibold text-text-muted/60 bg-input-bg px-2.5 py-1 rounded-full border border-input-border/60">{t("common.optionalBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("bookings.sectionExitDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("bookings.scheduledExitOptional")}</label>
              <DateTimePickerField
                value={form.scheduledExitTime}
                onChange={(v) => setForm((p) => ({ ...p, scheduledExitTime: v }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/bookings"
            className="px-5 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors">
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={handleSubmit} disabled={submitting || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("common.saving")}</> : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
