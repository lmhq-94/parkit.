"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Car, MapPin, ArrowRight, UserRound } from "lucide-react";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useDashboardStore } from "@/lib/store";
import { useToast } from "@/lib/toastStore";
import { PageLoader } from "@/components/PageLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

type ClientOption = { id: string; user?: { firstName?: string; lastName?: string; email?: string } };
type VehicleOption = { id: string; plate?: string; brand?: string; model?: string };
type ParkingOption = { id: string; name?: string };
type ValetOption = { id: string; user?: { firstName?: string; lastName?: string; email?: string } };
type Assignment = { valetId?: string; valet?: { id: string; staffRole?: string | null } };

const defaultForm = {
  clientId: "",
  vehicleId: "",
  parkingId: "",
  receptorValetId: "",
  driverValetId: "",
  delivererValetId: "",
};

export default function EditTicketPage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const selectedCompanyId = useDashboardStore((s) => s.selectedCompanyId);
  const [form, setForm] = useState(defaultForm);
  const [initialForm, setInitialForm] = useState(defaultForm);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [parkings, setParkings] = useState<ParkingOption[]>([]);
  const [valets, setValets] = useState<ValetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [ticket, c, v, p, valetsRes] = await Promise.all([
          apiClient.get<Record<string, unknown> & { assignments?: Assignment[] }>(`/tickets/${id}`),
          apiClient.get<ClientOption[]>("/clients"),
          apiClient.get<VehicleOption[]>("/vehicles"),
          apiClient.get<ParkingOption[]>("/parkings"),
          apiClient.get<ValetOption[]>("/valets"),
        ]);
        if (ticket) {
          const assignments = (ticket.assignments ?? []) as Assignment[];
          const byStaffRole = assignments.reduce<Record<string, string>>((acc, a) => {
            const staffRole = a.valet?.staffRole ?? "UNKNOWN";
            if (!acc[staffRole]) {
              acc[staffRole] = a.valetId ?? a.valet?.id ?? "";
            }
            return acc;
          }, {});
          const loaded = {
            clientId: String(ticket.clientId ?? ""),
            vehicleId: String(ticket.vehicleId ?? ""),
            parkingId: String(ticket.parkingId ?? ""),
            receptorValetId: String(byStaffRole.RECEPTIONIST ?? ""),
            driverValetId: String(byStaffRole.DRIVER ?? ""),
            delivererValetId: String(byStaffRole.DRIVER ?? ""),
          };
          setForm(loaded);
          setInitialForm(loaded);
        }
        setClients(Array.isArray(c) ? c : []);
        setVehicles(Array.isArray(v) ? v : []);
        setParkings(Array.isArray(p) ? p : []);
        setValets(Array.isArray(valetsRes) ? valetsRes : []);
      } catch {
        setError(t("common.loadingData"));
        showError(t("common.loadError"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, selectedCompanyId, showError, t]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.clientId || !form.vehicleId || !form.parkingId || !form.receptorValetId) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, string | null> = {
        clientId: form.clientId,
        vehicleId: form.vehicleId,
        parkingId: form.parkingId,
        receptorValetId: form.receptorValetId || null,
        driverValetId: form.driverValetId || null,
        delivererValetId: form.delivererValetId || null,
      };
      await apiClient.patch(`/tickets/${id}`, payload);
      showSuccess(t("common.saveSuccessShort"));
      router.push("/dashboard/tickets");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar el tiquete";
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm]
  );
  const isValid =
    form.clientId &&
    form.vehicleId &&
    form.parkingId &&
    form.receptorValetId;

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

      <div className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("tickets.sectionMain")}</p>
            <span className="text-[11px] font-medium text-red-500">{t("common.requiredBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("tickets.sectionMainDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("tickets.client")} <span className="text-company-primary">*</span></label>
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
              <label className={LABEL}>{t("tickets.vehicle")} <span className="text-company-primary">*</span></label>
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
              <label className={LABEL}>{t("tickets.parking")} <span className="text-company-primary">*</span></label>
              {parkings.length === 0 ? skel : (
                <SelectField value={form.parkingId} onChange={set("parkingId")} icon={MapPin}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {parkings.map(p => <option key={p.id} value={p.id}>{p.name ?? p.id}</option>)}
                </SelectField>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden mt-6">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("tickets.sectionAssignments")}</p>
            <span className="text-[11px] font-medium text-red-500">{t("common.requiredBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("tickets.sectionAssignmentsDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("tickets.receptorValet")} <span className="text-company-primary">*</span></label>
              {valets.length === 0 ? skel : (
                <SelectField value={form.receptorValetId} onChange={set("receptorValetId")} icon={UserRound}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {valets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {`${v.user?.firstName ?? ""} ${v.user?.lastName ?? ""}`.trim() || v.user?.email || v.id}
                    </option>
                  ))}
                </SelectField>
              )}
            </div>
            <div>
              <label className={LABEL}>{t("tickets.driverValet")}</label>
              {valets.length === 0 ? skel : (
                <SelectField value={form.driverValetId} onChange={set("driverValetId")} icon={UserRound}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {valets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {`${v.user?.firstName ?? ""} ${v.user?.lastName ?? ""}`.trim() || v.user?.email || v.id}
                    </option>
                  ))}
                </SelectField>
              )}
            </div>
            <div>
              <label className={LABEL}>{t("tickets.delivererValet")}</label>
              {valets.length === 0 ? skel : (
                <SelectField value={form.delivererValetId} onChange={set("delivererValetId")} icon={UserRound}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {valets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {`${v.user?.firstName ?? ""} ${v.user?.lastName ?? ""}`.trim() || v.user?.email || v.id}
                    </option>
                  ))}
                </SelectField>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/tickets"
            className="px-5 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors">
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={handleSubmit} disabled={submitting || !isDirty || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting ? <><LoadingSpinner size="sm" />{t("common.saving")}</> : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
