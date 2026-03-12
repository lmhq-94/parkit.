"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Car, MapPin } from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { DateTimePickerField } from "@/components/DateTimePickerField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useDashboardStore } from "@/lib/store";
import { useToast } from "@/lib/toastStore";
import { required, selectRequired } from "@/lib/validation";

const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

type ClientOption = { id: string; user?: { firstName?: string; lastName?: string; email?: string } };
type VehicleOption = { id: string; plate?: string; brand?: string; model?: string };
type ParkingOption = { id: string; name?: string };

const defaultForm = { clientId: "", vehicleId: "", parkingId: "", scheduledEntryTime: "", scheduledExitTime: "" };

export default function NewBookingPage() {
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
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = (): boolean => {
    const next: Partial<Record<keyof typeof defaultForm, string>> = {};
    const e1 = selectRequired(t, form.clientId); if (e1) next.clientId = e1;
    const e2 = selectRequired(t, form.vehicleId); if (e2) next.vehicleId = e2;
    const e3 = selectRequired(t, form.parkingId); if (e3) next.parkingId = e3;
    const e4 = required(t, form.scheduledEntryTime); if (e4) next.scheduledEntryTime = e4;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) return validate();
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post("/bookings", {
        clientId: form.clientId,
        vehicleId: form.vehicleId,
        parkingId: form.parkingId,
        scheduledEntryTime: new Date(form.scheduledEntryTime).toISOString(),
        ...(form.scheduledExitTime
          ? { scheduledExitTime: new Date(form.scheduledExitTime).toISOString() }
          : {}),
      });
      showSuccess(t("common.createSuccessShort"));
      router.push("/dashboard/bookings");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear la reserva";
      setError(msg);
      showError(msg);
      setSubmitting(false);
    }
  };

  const skel = (
    <div className="h-[46px] rounded-lg bg-input-bg border border-input-border animate-pulse" />
  );

  const steps = [
    {
      title: t("bookings.sectionMain"),
      description: t("bookings.sectionMainDesc"),
      badge: "required" as const,
      accentColor: "teal",
      isValid: () =>
        !!(form.clientId && form.vehicleId && form.parkingId && form.scheduledEntryTime) &&
        !loading,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>
              {t("bookings.client")} <span className="text-company-primary">*</span>
            </label>
            {loading ? (
              skel
            ) : (
              <SelectField value={form.clientId} onChange={set("clientId")} icon={Users} aria-invalid={!!errors.clientId}>
                <option value="">{t("common.selectPlaceholder")}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {`${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""}`.trim() ||
                      c.user?.email ||
                      c.id}
                  </option>
                ))}
              </SelectField>
            )}
            <div className="min-h-[1.25rem] mt-1">{errors.clientId && <p className="text-sm text-red-500" role="alert">{errors.clientId}</p>}</div>
          </div>
          <div>
            <label className={LABEL}>
              {t("bookings.vehicle")} <span className="text-company-primary">*</span>
            </label>
            {loading ? (
              skel
            ) : (
              <SelectField value={form.vehicleId} onChange={set("vehicleId")} icon={Car} aria-invalid={!!errors.vehicleId}>
                <option value="">{t("common.selectPlaceholder")}</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate
                      ? `${v.plate} — ${[v.brand, v.model].filter(Boolean).join(" ")}`
                      : v.id}
                  </option>
                ))}
              </SelectField>
            )}
            <div className="min-h-[1.25rem] mt-1">{errors.vehicleId && <p className="text-sm text-red-500" role="alert">{errors.vehicleId}</p>}</div>
          </div>
          <div>
            <label className={LABEL}>
              {t("bookings.parking")} <span className="text-company-primary">*</span>
            </label>
            {loading ? (
              skel
            ) : (
              <SelectField value={form.parkingId} onChange={set("parkingId")} icon={MapPin} aria-invalid={!!errors.parkingId}>
                <option value="">{t("common.selectPlaceholder")}</option>
                {parkings.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name ?? p.id}
                  </option>
                ))}
              </SelectField>
            )}
            <div className="min-h-[1.25rem] mt-1">{errors.parkingId && <p className="text-sm text-red-500" role="alert">{errors.parkingId}</p>}</div>
          </div>
          <div>
            <label className={LABEL}>
              {t("bookings.scheduledEntry")} <span className="text-company-primary">*</span>
            </label>
            <DateTimePickerField
              value={form.scheduledEntryTime}
              onChange={(v) => setForm((p) => ({ ...p, scheduledEntryTime: v }))}
              min={new Date().toISOString()}
            />
            <div className="min-h-[1.25rem] mt-1">{errors.scheduledEntryTime && <p className="text-sm text-red-500" role="alert">{errors.scheduledEntryTime}</p>}</div>
          </div>
        </div>
      ),
    },
    {
      title: t("bookings.sectionExit"),
      description: t("bookings.sectionExitDesc"),
      badge: "optional" as const,
      accentColor: "sky",
      isValid: () => true,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("bookings.scheduledExitOptional")}</label>
            <DateTimePickerField
              value={form.scheduledExitTime}
              onChange={(v) => setForm((p) => ({ ...p, scheduledExitTime: v }))}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <FormWizard
      steps={steps}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel={t("bookings.createBooking")}
      cancelHref="/dashboard/bookings"
      error={error}
      onValidateBeforeAction={validateStep}
    />
  );
}

