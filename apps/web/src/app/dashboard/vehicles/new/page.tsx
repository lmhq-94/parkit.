"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Car, Hash, Globe, Users } from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { BrandModelComboField } from "@/components/BrandModelComboField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { COUNTRIES } from "@/lib/companyOptions";
import { formatPlate, toTitleCase } from "@/lib/inputMasks";
import { required, plate as validatePlate, selectRequired } from "@/lib/validation";

type ClientOption = { id: string; user?: { firstName?: string; lastName?: string; email?: string } };

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
  clientId: "",
};

export default function NewVehiclePage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
  const [makes, setMakes] = useState<CatalogMake[]>([]);
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);

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
    (async () => {
      try {
        const data = await apiClient.get<ClientOption[]>("/clients");
        setClients(Array.isArray(data) ? data : []);
      } catch {
        setClients([]);
      } finally {
        setLoadingClients(false);
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
    if (!form.brand.trim() || !form.model.trim()) return null;
    try {
      const q = new URLSearchParams({ make: form.brand, model: form.model });
      if (form.year.trim()) q.set("year", form.year);
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
    if (form.brand.trim() && form.model.trim()) fetchDimensions();
  }, [form.brand, form.model, form.year, fetchDimensions]);

  const validate = (): boolean => {
    const next: Partial<Record<keyof typeof defaultForm, string>> = {};
    const e1 = required(t, form.plate) ?? validatePlate(t, form.plate); if (e1) next.plate = e1;
    const e2 = required(t, form.brand); if (e2) next.brand = e2;
    const e3 = required(t, form.model); if (e3) next.model = e3;
    const e4 = selectRequired(t, form.clientId); if (e4) next.clientId = e4;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      const next: Partial<Record<keyof typeof defaultForm, string>> = {};
      const e1 = required(t, form.plate) ?? validatePlate(t, form.plate); if (e1) next.plate = e1;
      const e2 = required(t, form.brand); if (e2) next.brand = e2;
      const e3 = required(t, form.model); if (e3) next.model = e3;
      const e4 = selectRequired(t, form.clientId); if (e4) next.clientId = e4;
      setErrors(next);
      return Object.keys(next).length === 0;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
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
      const created = await apiClient.post<{ id: string }>("/vehicles", {
        plate: form.plate.trim().toUpperCase(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: form.year !== "" ? Number(form.year) : undefined,
        countryCode: form.countryCode.trim() || undefined,
        ...(Object.keys(dimensions ?? {}).length > 0 && { dimensions }),
      });
      await apiClient.post(`/clients/${form.clientId.trim()}/vehicles`, {
        vehicleId: created.id,
        isPrimary: true,
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
      isValid: () => !!(form.plate.trim() && form.brand.trim() && form.model.trim() && form.clientId.trim()),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("vehicles.owner")} <span className="text-company-primary">*</span></label>
            {loadingClients ? (
              <div className="h-[46px] rounded-lg bg-input-bg border border-input-border animate-pulse" />
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
            <label className={LABEL}>{t("vehicles.plate")} <span className="text-company-primary">*</span></label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input value={form.plate} onChange={(e) => setForm((p) => ({ ...p, plate: formatPlate(e.target.value) }))} placeholder={t("common.placeholderPlate")} className={IL} aria-invalid={!!errors.plate} />
            </div>
            <div className="min-h-[1.25rem] mt-1">{errors.plate && <p className="text-sm text-red-500" role="alert">{errors.plate}</p>}</div>
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
            <div className="min-h-[1.25rem] mt-1">{errors.brand && <p className="text-sm text-red-500" role="alert">{errors.brand}</p>}</div>
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
                  aria-invalid={!!errors.model}
                />
              </div>
            )}
            <div className="min-h-[1.25rem] mt-1">{errors.model && <p className="text-sm text-red-500" role="alert">{errors.model}</p>}</div>
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
              <input type="number" inputMode="numeric" min={1} max={9999} value={form.lengthCm} onChange={(e) => setForm((p) => ({ ...p, lengthCm: e.target.value.replace(/\D/g, "") }))} placeholder="cm" className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.widthCm")}</label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="number" inputMode="numeric" min={1} max={9999} value={form.widthCm} onChange={(e) => setForm((p) => ({ ...p, widthCm: e.target.value.replace(/\D/g, "") }))} placeholder="cm" className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.heightCm")}</label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="number" inputMode="numeric" min={1} max={9999} value={form.heightCm} onChange={(e) => setForm((p) => ({ ...p, heightCm: e.target.value.replace(/\D/g, "") }))} placeholder="cm" className={IL} />
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
      onValidateBeforeAction={validateStep}
      onBeforeNext={async (fromStep, toStep) => {
        if (fromStep === 0 && toStep === 1 && form.brand.trim() && form.model.trim()) {
          const d = await getDimensionsData();
          console.log("[Vehicles] Respuesta dimensiones al pasar al paso 2:", d);
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
