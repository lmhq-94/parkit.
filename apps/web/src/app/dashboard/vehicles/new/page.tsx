"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Car, Hash, Globe } from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { BrandModelComboField } from "@/components/BrandModelComboField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { COUNTRIES } from "@/lib/companyOptions";
import { formatPlate, toTitleCase } from "@/lib/inputMasks";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
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
  const { showSuccess, showError } = useToast();
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

  const brandInCatalog = makes.some(
    (m) => m.name.toLowerCase() === form.brand.trim().toLowerCase()
  );

  useEffect(() => {
    (async () => {
      try {
        const url = form.year.trim()
          ? `/vehicles/catalog/makes?year=${encodeURIComponent(form.year)}`
          : "/vehicles/catalog/makes";
        const data = await apiClient.get<CatalogMake[]>(url);
        setMakes(Array.isArray(data) ? data : []);
      } catch {
        setMakes([]);
      } finally {
        setLoadingMakes(false);
      }
    })();
  }, [form.year]);

  useEffect(() => {
    if (!form.brand.trim()) {
      setModels([]);
      setValue("model", "");
      return;
    }
    setLoadingModels(true);
    (async () => {
      try {
        const params = new URLSearchParams({ make: form.brand });
        if (form.year.trim()) params.set("year", form.year);
        const data = await apiClient.get<CatalogModel[]>(
          `/vehicles/catalog/models?${params.toString()}`
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
    // Solo al cambiar marca: no refetch al escribir año para no perder el modelo elegido
  }, [form.brand, setValue]);

  const getDimensionsData = useCallback(async (): Promise<{ lengthCm?: number; widthCm?: number; heightCm?: number } | null> => {
    if (!form.brand.trim() || !form.model.trim() || !form.year.trim()) return null;
    try {
      const q = new URLSearchParams({ make: form.brand, model: form.model, year: form.year });
      const d = await apiClient.get<{ lengthCm?: number; widthCm?: number; heightCm?: number }>(
        `/vehicles/catalog/dimensions?${q.toString()}`
      );
      if (d && (d.lengthCm != null || d.widthCm != null || d.heightCm != null)) return d;
    } catch {
      // ignore
    }
    return null;
  }, [form.brand, form.model, form.year]);

  const fetchDimensions = useCallback(async () => {
    const d = await getDimensionsData();
    if (d) {
      setForm((p) => ({
        ...p,
        lengthCm: d.lengthCm != null ? String(d.lengthCm) : p.lengthCm,
        widthCm: d.widthCm != null ? String(d.widthCm) : p.widthCm,
        heightCm: d.heightCm != null ? String(d.heightCm) : p.heightCm,
      }));
    }
  }, [getDimensionsData]);

  useEffect(() => {
    if (form.brand.trim() && form.model.trim() && form.year.trim()) fetchDimensions();
  }, [form.brand, form.model, form.year, fetchDimensions]);

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
      showSuccess(t("common.createSuccessShort"));
      router.push("/dashboard/vehicles");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear el vehículo";
      setError(msg);
      showError(msg);
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
            <label className={LABEL}>{t("vehicles.plate")} <span className="text-company-primary">*</span></label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input value={form.plate} onChange={(e) => setForm((p) => ({ ...p, plate: formatPlate(e.target.value) }))} placeholder={t("common.placeholderPlate")} className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.brand")} <span className="text-company-primary">*</span></label>
            <BrandModelComboField
              value={form.brand}
              onChange={(v) => setForm((p) => ({ ...p, brand: v, model: "" }))}
              options={makes.map((m) => ({ value: m.name, label: toTitleCase(m.name) }))}
              loading={loadingMakes}
              placeholder={t("common.selectOrType")}
              icon={Car}
            />
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.model")} <span className="text-company-primary">*</span></label>
            {brandInCatalog ? (
              <BrandModelComboField
                value={form.model}
                onChange={(v) => setForm((p) => ({ ...p, model: v }))}
                options={models.map((m) => ({ value: m.name, label: toTitleCase(m.name) }))}
                loading={loadingModels}
                placeholder={t("common.selectOrType")}
                icon={Car}
                disabled={!form.brand.trim()}
                disabledPlaceholder={t("vehicles.selectBrandFirst")}
              />
            ) : (
              <div className="relative group">
                <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  value={form.model}
                  onChange={set("model")}
                  placeholder={t("common.selectOrType")}
                  className={IL}
                />
              </div>
            )}
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.year")}</label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="number" min={1900} max={new Date().getFullYear() + 1} value={form.year} onChange={set("year")} placeholder={t("common.placeholderYear")} className={IL} />
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
            <label className={LABEL}>{t("vehicles.countryCode")}</label>
            <SelectField value={form.countryCode} onChange={set("countryCode")} icon={Globe}>
              <option value="">{t("common.selectPlaceholder")}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </SelectField>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.lengthCm")}</label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="number" min={1} value={form.lengthCm} onChange={set("lengthCm")} placeholder="cm" className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.widthCm")}</label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="number" min={1} value={form.widthCm} onChange={set("widthCm")} placeholder="cm" className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.heightCm")}</label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
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
      onBeforeNext={async (fromStep, toStep) => {
        if (fromStep === 0 && toStep === 1 && form.brand.trim() && form.model.trim() && form.year.trim()) {
          const d = await getDimensionsData();
          if (d) {
            setForm((p) => ({
              ...p,
              lengthCm: d.lengthCm != null ? String(d.lengthCm) : p.lengthCm,
              widthCm: d.widthCm != null ? String(d.widthCm) : p.widthCm,
              heightCm: d.heightCm != null ? String(d.heightCm) : p.heightCm,
            }));
          }
        }
      }}
      error={error}
    />
  );
}
