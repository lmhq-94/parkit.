"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Hash, Tag, Navigation, Radius } from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { AddressPickerModal } from "@/components/AddressPickerModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/lib/toastStore";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

const PARKING_TYPES = ["OPEN", "COVERED", "TOWER", "UNDERGROUND", "ELEVATOR"] as const;

const defaultForm = {
  name: "", address: "", type: "OPEN", totalSlots: "",
  requiresBooking: false, latitude: "", longitude: "", geofenceRadius: "50",
};

export default function NewParkingPage() {
  const { t, tEnum } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

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
      showSuccess(t("common.createSuccessShort"));
      router.push("/dashboard/parkings");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear el estacionamiento";
      setError(msg);
      showError(msg);
      setSubmitting(false);
    }
  };

  const n = Number(form.totalSlots);
  const step1Valid = !!(form.name.trim() && form.address.trim() && form.type && form.totalSlots !== "" && Number.isFinite(n) && n > 0);

  const steps = [
    {
      title: t("parkings.sectionMain"),
      description: t("parkings.sectionMainDesc"),
      badge: "required" as const,
      accentColor: "orange",
      isValid: () => step1Valid,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={LABEL}>{t("parkings.name")} <span className="text-company-primary">*</span></label>
            <div className="relative group">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input value={form.name} onChange={set("name")} placeholder={t("common.placeholderName")} className={IL} />
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={LABEL}>{t("parkings.address")} <span className="text-company-primary">*</span></label>
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input value={form.address} readOnly placeholder={t("common.placeholderAddress")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} />
              </div>
              <button
                type="button"
                onClick={() => setAddressPickerOpen(true)}
                className="shrink-0 px-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-secondary text-sm font-medium hover:bg-company-primary-subtle hover:border-company-primary-muted hover:text-company-primary transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {t("companies.pickAddressOnMap")}
              </button>
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("parkings.type")} <span className="text-company-primary">*</span></label>
            <SelectField value={form.type} onChange={set("type")} icon={Tag}>
              {PARKING_TYPES.map(pt => <option key={pt} value={pt}>{tEnum("parkingType", pt)}</option>)}
            </SelectField>
          </div>
          <div>
            <label className={LABEL}>{t("parkings.totalSlots")} <span className="text-company-primary">*</span></label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="number" min={1} value={form.totalSlots} onChange={set("totalSlots")} placeholder={t("common.placeholderNumber")} className={IL} />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-1 sm:pt-7">
            <button
              type="button" role="switch" aria-checked={form.requiresBooking}
              onClick={() => setForm(p => ({ ...p, requiresBooking: !p.requiresBooking }))}
              className={`relative w-11 h-6 rounded-full shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page ${form.requiresBooking ? "bg-company-primary" : "bg-input-border"}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${form.requiresBooking ? "translate-x-5" : "translate-x-0"}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-text-secondary">{t("parkings.requiresBooking")}</p>
              <p className="text-xs text-text-muted">{form.requiresBooking ? t("parkings.requiresBookingOn") : t("parkings.requiresBookingOff")}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("parkings.sectionGeo"),
      description: t("parkings.sectionGeoDesc"),
      badge: "optional" as const,
      accentColor: "emerald",
      isValid: () => true,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("parkings.latitude")}</label>
            <div className="relative group">
              <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="number" step="any" value={form.latitude} readOnly placeholder={t("common.placeholderLatitude")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("parkings.longitude")}</label>
            <div className="relative group">
              <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="number" step="any" value={form.longitude} readOnly placeholder={t("common.placeholderLongitude")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("parkings.geofenceRadius")}</label>
            <div className="relative group">
              <Radius className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="number" min={1} value={form.geofenceRadius} readOnly placeholder={t("common.placeholderRadius")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <FormWizard
        steps={steps}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("parkings.createParking")}
        cancelHref="/dashboard/parkings"
        error={error}
      />
      <AddressPickerModal
        open={addressPickerOpen}
        onClose={() => setAddressPickerOpen(false)}
        onSelect={(address, coords) => {
          setForm((p) => ({
            ...p,
            address,
            ...(coords && {
              latitude: String(coords.lat),
              longitude: String(coords.lon),
              geofenceRadius: "50",
            }),
          }));
          setAddressPickerOpen(false);
        }}
        initialValue={form.address}
      />
    </>
  );
}
