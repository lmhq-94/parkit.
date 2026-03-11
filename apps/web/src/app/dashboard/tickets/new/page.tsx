"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ticket, Users, Car, MapPin, ArrowRight } from "lucide-react";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useDashboardStore } from "@/lib/store";
import { useToast } from "@/lib/toastStore";
import { PageLoader } from "@/components/PageLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { selectRequired } from "@/lib/validation";

const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

type ClientOption = { id: string; user?: { firstName?: string; lastName?: string; email?: string } };
type VehicleOption = { id: string; plate?: string; brand?: string; model?: string };
type ParkingOption = { id: string; name?: string };

const defaultForm = { clientId: "", vehicleId: "", parkingId: "" };

export default function NewTicketPage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const selectedCompanyId = useDashboardStore((s) => s.selectedCompanyId);
  const [form, setForm] = useState(defaultForm);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [parkings, setParkings] = useState<ParkingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});

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
      } catch {
        setClients([]);
        setVehicles([]);
        setParkings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCompanyId]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = (): boolean => {
    const next: Partial<Record<keyof typeof defaultForm, string>> = {};
    const e1 = selectRequired(t, form.clientId); if (e1) next.clientId = e1;
    const e2 = selectRequired(t, form.vehicleId); if (e2) next.vehicleId = e2;
    const e3 = selectRequired(t, form.parkingId); if (e3) next.parkingId = e3;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post("/tickets", {
        clientId: form.clientId,
        vehicleId: form.vehicleId,
        parkingId: form.parkingId,
      });
      showSuccess(t("common.createSuccessShort"));
      router.push("/dashboard/tickets");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear el tiquete";
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = !errors.clientId && !errors.vehicleId && !errors.parkingId && form.clientId && form.vehicleId && form.parkingId;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[200px]">
        <PageLoader />
      </div>
    );
  }

  const skel = <div className="h-[46px] rounded-lg bg-input-bg border border-input-border animate-pulse" />;

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-rose-500/8 to-transparent">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("tickets.sectionMain")}</p>
            <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">
              {t("common.requiredBadge")}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("tickets.sectionMainDesc")}</p>
        </div>
        <div className="p-6 pt-4 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>
                {t("tickets.client")} <span className="text-company-primary">*</span>
              </label>
              {clients.length === 0 ? skel : (
                <SelectField value={form.clientId} onChange={set("clientId")} icon={Users} aria-invalid={!!errors.clientId}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {`${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""}`.trim() || c.user?.email || c.id}
                    </option>
                  ))}
                </SelectField>
              )}
              {errors.clientId && <p className="mt-1 text-sm text-red-500">{errors.clientId}</p>}
            </div>
            <div>
              <label className={LABEL}>
                {t("tickets.vehicle")} <span className="text-company-primary">*</span>
              </label>
              {vehicles.length === 0 ? skel : (
                <SelectField value={form.vehicleId} onChange={set("vehicleId")} icon={Car} aria-invalid={!!errors.vehicleId}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate ? `${v.plate} — ${[v.brand, v.model].filter(Boolean).join(" ")}` : v.id}
                    </option>
                  ))}
                </SelectField>
              )}
              {errors.vehicleId && <p className="mt-1 text-sm text-red-500">{errors.vehicleId}</p>}
            </div>
            <div>
              <label className={LABEL}>
                {t("tickets.parking")} <span className="text-company-primary">*</span>
              </label>
              {parkings.length === 0 ? skel : (
                <SelectField value={form.parkingId} onChange={set("parkingId")} icon={MapPin} aria-invalid={!!errors.parkingId}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {parkings.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name ?? p.id}
                    </option>
                  ))}
                </SelectField>
              )}
              {errors.parkingId && <p className="mt-1 text-sm text-red-500">{errors.parkingId}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex items-start gap-3 bg-rose-500/5 rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0 mt-0.5">
          <Ticket className="w-4 h-4 text-rose-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{t("tickets.entryTicket")}</p>
          <p className="text-xs text-text-muted mt-0.5">{t("tickets.entryTicketNote")}</p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/dashboard/tickets"
            className="px-5 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors"
          >
            {t("common.cancel")}
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                {t("common.saving")}
              </>
            ) : (
              <>
                {t("tickets.createTicket")}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
