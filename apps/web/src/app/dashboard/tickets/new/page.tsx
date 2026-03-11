"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Car, MapPin, UserRound } from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useDashboardStore } from "@/lib/store";
import { useToast } from "@/lib/toastStore";
import { PageLoader } from "@/components/PageLoader";
import { selectRequired } from "@/lib/validation";

const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

type ClientOption = { id: string; user?: { firstName?: string; lastName?: string; email?: string } };
type VehicleOption = { id: string; plate?: string; brand?: string; model?: string };
type ParkingOption = { id: string; name?: string };
type ValetOption = { id: string; user?: { firstName?: string; lastName?: string; email?: string } };

const defaultForm = {
  clientId: "",
  vehicleId: "",
  parkingId: "",
  receptorValetId: "",
  driverValetId: "",
  delivererValetId: "",
};

export default function NewTicketPage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const selectedCompanyId = useDashboardStore((s) => s.selectedCompanyId);
  const [form, setForm] = useState(defaultForm);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [parkings, setParkings] = useState<ParkingOption[]>([]);
  const [valets, setValets] = useState<ValetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});

  useEffect(() => {
    (async () => {
      try {
        const [c, v, p, valetsRes] = await Promise.all([
          apiClient.get<ClientOption[]>("/clients"),
          apiClient.get<VehicleOption[]>("/vehicles"),
          apiClient.get<ParkingOption[]>("/parkings"),
          apiClient.get<ValetOption[]>("/valets"),
        ]);
        setClients(Array.isArray(c) ? c : []);
        setVehicles(Array.isArray(v) ? v : []);
        setParkings(Array.isArray(p) ? p : []);
        setValets(Array.isArray(valetsRes) ? valetsRes : []);
      } catch {
        setClients([]);
        setVehicles([]);
        setParkings([]);
        setValets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCompanyId]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validateStep1 = (): boolean => {
    const next: Partial<Record<keyof typeof defaultForm, string>> = {};
    const e1 = selectRequired(t, form.clientId); if (e1) next.clientId = e1;
    const e2 = selectRequired(t, form.vehicleId); if (e2) next.vehicleId = e2;
    const e3 = selectRequired(t, form.parkingId); if (e3) next.parkingId = e3;
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const validateStep2 = (): boolean => {
    const next: Partial<Record<keyof typeof defaultForm, string>> = {};
    const e4 = selectRequired(t, form.receptorValetId);
    if (e4) next.receptorValetId = e4;
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) return validateStep1();
    if (stepIndex === 1) return validateStep2();
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, string> = {
        clientId: form.clientId,
        vehicleId: form.vehicleId,
        parkingId: form.parkingId,
        receptorValetId: form.receptorValetId,
      };
      if (form.driverValetId) payload.driverValetId = form.driverValetId;
      if (form.delivererValetId) payload.delivererValetId = form.delivererValetId;
      await apiClient.post("/tickets", payload);
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[200px]">
        <PageLoader />
      </div>
    );
  }

  const skel = <div className="h-[46px] rounded-lg bg-input-bg border border-input-border animate-pulse" />;

  const step1Valid =
    !!form.clientId && !!form.vehicleId && !!form.parkingId && !errors.clientId && !errors.vehicleId && !errors.parkingId;
  const step2Valid =
    !!form.receptorValetId && !errors.receptorValetId;

  const steps = [
    {
      title: t("tickets.sectionMain"),
      description: t("tickets.sectionMainDesc"),
      badge: "required" as const,
      accentColor: "rose",
      isValid: () => step1Valid,
      content: (
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
      ),
    },
    {
      title: t("tickets.sectionAssignments"),
      description: t("tickets.sectionAssignmentsDesc"),
      badge: "required" as const,
      accentColor: "rose",
      isValid: () => step2Valid,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>
              {t("tickets.receptorValet")} <span className="text-company-primary">*</span>
            </label>
            {valets.length === 0 ? skel : (
              <SelectField
                value={form.receptorValetId}
                onChange={set("receptorValetId")}
                icon={UserRound}
                aria-invalid={!!errors.receptorValetId}
              >
                <option value="">{t("common.selectPlaceholder")}</option>
                {valets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {`${v.user?.firstName ?? ""} ${v.user?.lastName ?? ""}`.trim() || v.user?.email || v.id}
                  </option>
                ))}
              </SelectField>
            )}
            {errors.receptorValetId && <p className="mt-1 text-sm text-red-500">{errors.receptorValetId}</p>}
          </div>
          <div>
            <label className={LABEL}>{t("tickets.driverValet")}</label>
            {valets.length === 0 ? skel : (
              <SelectField
                value={form.driverValetId}
                onChange={set("driverValetId")}
                icon={UserRound}
                aria-invalid={!!errors.driverValetId}
              >
                <option value="">{t("common.selectPlaceholder")}</option>
                {valets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {`${v.user?.firstName ?? ""} ${v.user?.lastName ?? ""}`.trim() || v.user?.email || v.id}
                  </option>
                ))}
              </SelectField>
            )}
            {errors.driverValetId && <p className="mt-1 text-sm text-red-500">{errors.driverValetId}</p>}
          </div>
          <div>
            <label className={LABEL}>{t("tickets.delivererValet")}</label>
            {valets.length === 0 ? skel : (
              <SelectField
                value={form.delivererValetId}
                onChange={set("delivererValetId")}
                icon={UserRound}
                aria-invalid={!!errors.delivererValetId}
              >
                <option value="">{t("common.selectPlaceholder")}</option>
                {valets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {`${v.user?.firstName ?? ""} ${v.user?.lastName ?? ""}`.trim() || v.user?.email || v.id}
                  </option>
                ))}
              </SelectField>
            )}
            {errors.delivererValetId && <p className="mt-1 text-sm text-red-500">{errors.delivererValetId}</p>}
          </div>
        </div>
      ),
    },
  ];

  const entryTicketNote = (
    <span className="text-xs text-text-muted">{t("tickets.entryTicketNote")}</span>
  );

  return (
    <FormWizard
      steps={steps}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel={t("tickets.createTicket")}
      cancelHref="/dashboard/tickets"
      error={error}
      footerNote={entryTicketNote}
      onValidateBeforeAction={validateStep}
    />
  );
}
