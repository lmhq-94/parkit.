"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Hash, Globe, Tag } from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

const defaultForm = { plate: "", brand: "", model: "", year: "", countryCode: "CR" };

export default function NewVehiclePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.plate.trim() || !form.brand.trim() || !form.model.trim()) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.post("/vehicles", {
        plate: form.plate.trim().toUpperCase(),
        brand: form.brand.trim(), model: form.model.trim(),
        year: form.year !== "" ? Number(form.year) : undefined,
        countryCode: form.countryCode.trim() || undefined,
      });
      router.push("/dashboard/vehicles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el vehículo");
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: t("vehicles.sectionMain"),
      description: t("vehicles.sectionMainDesc"),
      badge: "required" as const,
      accentColor: "blue",
      isValid: () => !!(form.plate.trim() && form.brand.trim() && form.model.trim()),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("vehicles.plate")} <span className="text-sky-500">*</span></label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
              <input value={form.plate} onChange={set("plate")} placeholder={t("common.placeholderPlate")} className={IL + " uppercase"} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.brand")} <span className="text-sky-500">*</span></label>
            <div className="relative group">
              <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
              <input value={form.brand} onChange={set("brand")} placeholder={t("common.placeholderBrand")} className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.model")} <span className="text-sky-500">*</span></label>
            <div className="relative group">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
              <input value={form.model} onChange={set("model")} placeholder={t("common.placeholderModel")} className={IL} />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("vehicles.sectionExtra"),
      description: t("vehicles.sectionExtraDesc"),
      badge: "optional" as const,
      accentColor: "sky",
      isValid: () => true,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("vehicles.year")}</label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
              <input type="number" min={1900} max={new Date().getFullYear() + 1} value={form.year} onChange={set("year")} placeholder={t("common.placeholderYear")} className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.countryCode")}</label>
            <div className="relative group">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
              <input value={form.countryCode} onChange={set("countryCode")} placeholder={t("common.placeholderCountryCode")} className={IL} />
            </div>
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
      submitLabel={t("vehicles.createVehicle")}
      cancelHref="/dashboard/vehicles"
      error={error}
    />
  );
}
