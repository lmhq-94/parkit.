"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Car, Hash, Globe } from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { formatPlate, toTitleCase } from "@/lib/inputMasks";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

type CatalogMake = { id: number; name: string };
type CatalogModel = { id: number; name: string };

const defaultForm = {
  plate: "",
  brand: "",
  model: "",
  year: "",
  countryCode: "CR",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
};

export default function NewVehiclePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [makes, setMakes] = useState<CatalogMake[]>([]);
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const setValue = useCallback((k: keyof typeof defaultForm, value: string) => {
    setForm((p) => ({ ...p, [k]: value }));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.get<CatalogMake[]>("/vehicles/catalog/makes");
        setMakes(Array.isArray(data) ? data : []);
      } catch {
        setMakes([]);
      } finally {
        setLoadingMakes(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!form.brand.trim()) {
      setModels([]);
      setValue("model", "");
      return;
    }
    setLoadingModels(true);
    (async () => {
      try {
        const data = await apiClient.get<CatalogModel[]>(
          `/vehicles/catalog/models?make=${encodeURIComponent(form.brand)}`
        );
        setModels(Array.isArray(data) ? data : []);
        setValue("model", "");
      } catch {
        setModels([]);
        setValue("model", "");
      } finally {
        setLoadingModels(false);
      }
    })();
  }, [form.brand, setValue]);

  const fetchDimensions = useCallback(async () => {
    if (!form.brand.trim() || !form.model.trim()) return;
    try {
      const q = new URLSearchParams({ make: form.brand, model: form.model });
      if (form.year.trim()) q.set("year", form.year);
      const d = await apiClient.get<{ lengthCm?: number; widthCm?: number; heightCm?: number }>(
        `/vehicles/catalog/dimensions?${q.toString()}`
      );
      if (d && (d.lengthCm != null || d.widthCm != null || d.heightCm != null)) {
        setForm((p) => ({
          ...p,
          lengthCm: d.lengthCm != null ? String(d.lengthCm) : p.lengthCm,
          widthCm: d.widthCm != null ? String(d.widthCm) : p.widthCm,
          heightCm: d.heightCm != null ? String(d.heightCm) : p.heightCm,
        }));
      }
    } catch {
      // ignore
    }
  }, [form.brand, form.model, form.year]);

  useEffect(() => {
    if (form.brand.trim() && form.model.trim()) fetchDimensions();
  }, [form.brand, form.model, fetchDimensions]);

  const handleSubmit = async () => {
    if (!form.plate.trim() || !form.brand.trim() || !form.model.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const dimensions =
        form.lengthCm !== "" || form.widthCm !== "" || form.heightCm !== ""
          ? {
              ...(form.lengthCm !== "" && { lengthCm: Number(form.lengthCm) }),
              ...(form.widthCm !== "" && { widthCm: Number(form.widthCm) }),
              ...(form.heightCm !== "" && { heightCm: Number(form.heightCm) }),
            }
          : undefined;
      await apiClient.post("/vehicles", {
        plate: form.plate.trim().toUpperCase(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: form.year !== "" ? Number(form.year) : undefined,
        countryCode: form.countryCode.trim() || undefined,
        ...(Object.keys(dimensions ?? {}).length > 0 && { dimensions }),
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
              <input value={form.plate} onChange={(e) => setForm((p) => ({ ...p, plate: formatPlate(e.target.value) }))} placeholder={t("common.placeholderPlate")} className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.brand")} <span className="text-sky-500">*</span></label>
            <SelectField value={form.brand} onChange={set("brand")} icon={Car}>
              <option value="">{loadingMakes ? t("common.loading") : t("common.selectPlaceholder")}</option>
              {makes.map((m) => (
                <option key={m.id} value={m.name}>{toTitleCase(m.name)}</option>
              ))}
            </SelectField>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.model")} <span className="text-sky-500">*</span></label>
            <SelectField value={form.model} onChange={set("model")} icon={Car}>
              <option value="">{loadingModels ? t("common.loading") : form.brand ? t("common.selectPlaceholder") : t("vehicles.selectBrandFirst")}</option>
              {models.map((m) => (
                <option key={m.id} value={m.name}>{toTitleCase(m.name)}</option>
              ))}
            </SelectField>
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
          <div>
            <label className={LABEL}>{t("vehicles.lengthCm")}</label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
              <input type="number" min={1} value={form.lengthCm} onChange={set("lengthCm")} placeholder="cm" className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.widthCm")}</label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
              <input type="number" min={1} value={form.widthCm} onChange={set("widthCm")} placeholder="cm" className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.heightCm")}</label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
              <input type="number" min={1} value={form.heightCm} onChange={set("heightCm")} placeholder="cm" className={IL} />
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
