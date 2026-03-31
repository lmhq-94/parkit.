"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Car, Hash, Globe, Users, Ruler, Weight } from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { BrandModelComboField } from "@/components/BrandModelComboField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { useDashboardStore } from "@/lib/store";
import { COUNTRIES } from "@/lib/companyOptions";
import { formatPlate, toTitleCase } from "@/lib/inputMasks";
import { required, plate as validatePlate, selectRequired } from "@/lib/validation";
import { getVehicleColorOptions } from "@parkit/shared/vehicleColors";

/** Customers (users with CUSTOMER role) for the company - same list as dashboard Customers page */
type CustomerOption = { id: string; firstName?: string; lastName?: string; email?: string };

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const IL_UNIT = "w-full pl-10 pr-10 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

type CatalogMake = { id: number; name: string };
type CatalogModel = { id: number; name: string };

const defaultForm = {
  plate: "",
  brand: "",
  model: "",
  color: "",
  year: "",
  countryCode: "CR",
  lengthM: "",
  widthM: "",
  heightM: "",
  weightKg: "",
  clientId: "",
};

export default function NewVehiclePage() {
  const { t, locale } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const selectedCompanyId = useDashboardStore((s: { selectedCompanyId: string | null }) => s.selectedCompanyId);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
  const [makes, setMakes] = useState<CatalogMake[]>([]);
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
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

  // Only when brand changes: do not refetch while typing year to avoid losing selected model
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!selectedCompanyId) {
      setCustomers([]);
      setLoadingClients(false);
      return;
    }
    setLoadingClients(true);
    (async () => {
      try {
        const data = await apiClient.get<CustomerOption[]>("/users?systemRole=CUSTOMER");
        setCustomers(Array.isArray(data) ? data : []);
      } catch {
        setCustomers([]);
      } finally {
        setLoadingClients(false);
      }
    })();
  }, [selectedCompanyId]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.brand, setValue]);

  const getDimensionsData = useCallback(async (): Promise<{ lengthCm?: number; widthCm?: number; heightCm?: number; weightKg?: number } | null> => {
    if (!form.brand.trim() || !form.model.trim()) return null;
    try {
      const q = new URLSearchParams({ make: form.brand, model: form.model });
      if (form.year.trim()) q.set("year", form.year);
      const d = await apiClient.get<{ lengthCm?: number; widthCm?: number; heightCm?: number; weightKg?: number }>(
        `/vehicles/catalog/dimensions?${q.toString()}`
      );
      if (
        d &&
        (d.lengthCm != null ||
          d.widthCm != null ||
          d.heightCm != null ||
          d.weightKg != null)
      )
        return d;
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
        lengthM: d.lengthCm != null ? String(Number((d.lengthCm / 100).toFixed(2))) : p.lengthM,
        widthM: d.widthCm != null ? String(Number((d.widthCm / 100).toFixed(2))) : p.widthM,
        heightM: d.heightCm != null ? String(Number((d.heightCm / 100).toFixed(2))) : p.heightM,
        weightKg:
          d.weightKg != null
            ? String(Number(d.weightKg.toFixed(1)))
            : p.weightKg,
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
    const e5 = required(t, form.year); if (e5) next.year = e5;
    const e4 = selectRequired(t, form.clientId); if (e4) next.clientId = e4;
    const e6 = required(t, form.lengthM); if (e6) next.lengthM = e6;
    const e7 = required(t, form.widthM); if (e7) next.widthM = e7;
    const e8 = required(t, form.heightM); if (e8) next.heightM = e8;
    const e9 = required(t, form.weightKg); if (e9) next.weightKg = e9;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      const next: Partial<Record<keyof typeof defaultForm, string>> = {};
      const e1 = required(t, form.plate) ?? validatePlate(t, form.plate); if (e1) next.plate = e1;
      const e2 = required(t, form.brand); if (e2) next.brand = e2;
      const e3 = required(t, form.model); if (e3) next.model = e3;
      const e5 = required(t, form.year); if (e5) next.year = e5;
      const e4 = selectRequired(t, form.clientId); if (e4) next.clientId = e4;
      setErrors(next);
      return Object.keys(next).length === 0;
    }
    if (stepIndex === 1) {
      const next: Partial<Record<keyof typeof defaultForm, string>> = {};
      const e6 = required(t, form.lengthM); if (e6) next.lengthM = e6;
      const e7 = required(t, form.widthM); if (e7) next.widthM = e7;
      const e8 = required(t, form.heightM); if (e8) next.heightM = e8;
      const e9 = required(t, form.weightKg); if (e9) next.weightKg = e9;
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
      const lengthCm = form.lengthM.trim() !== "" ? Math.round(Number(form.lengthM) * 100) : undefined;
      const widthCm = form.widthM.trim() !== "" ? Math.round(Number(form.widthM) * 100) : undefined;
      const heightCm = form.heightM.trim() !== "" ? Math.round(Number(form.heightM) * 100) : undefined;
      const weightKg = form.weightKg.trim() !== "" ? Number(form.weightKg) : undefined;
      const dimensions = {
        lengthCm: lengthCm!,
        widthCm: widthCm!,
        heightCm: heightCm!,
        weightKg: weightKg!,
      };
      const created = await apiClient.post<{ id: string }>("/vehicles", {
        plate: form.plate.trim().toUpperCase(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        color: form.color.trim() || undefined,
        year: form.year !== "" ? Number(form.year) : undefined,
        countryCode: form.countryCode.trim() || undefined,
        dimensions,
      });
      await apiClient.post(`/users/${form.clientId.trim()}/vehicles`, {
        vehicleId: created.id,
        isPrimary: true,
      });
      showSuccess(t("common.createSuccessShort"));
      router.push("/dashboard/vehicles");
    } catch (err) {
      const msg = getTranslatedApiErrorMessage(err, t) || t("apiErrors.requestFailed");
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
      isValid: () => !!(form.plate.trim() && form.brand.trim() && form.model.trim() && form.year.trim() && form.clientId.trim()),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("vehicles.owner")} <span className="text-company-primary">*</span></label>
            {loadingClients ? (
              <div className="h-[46px] rounded-lg bg-input-bg border border-input-border animate-pulse" />
            ) : (
              <SelectField value={form.clientId} onChange={set("clientId")} icon={Users} aria-invalid={!!errors.clientId}>
                <option value="">{t("common.selectPlaceholder")}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {`${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || c.email || c.id}
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
            <label className={LABEL}>{t("vehicles.color")}</label>
            <SelectField value={form.color} onChange={set("color")} icon={Car}>
              <option value="">{t("common.selectPlaceholder")}</option>
              {getVehicleColorOptions(locale).map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </SelectField>
          </div>
          <div>
            <label className={LABEL}>
              {t("vehicles.year")} <span className="text-company-primary">*</span>
            </label>
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input
                type="number"
                min={1900}
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={set("year")}
                placeholder={t("common.placeholderYear")}
                className={IL}
                aria-invalid={!!errors.year}
              />
            </div>
            <div className="min-h-[1.25rem] mt-1">
              {errors.year && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.year}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.countryCode")}</label>
            <SelectField value={form.countryCode} onChange={set("countryCode")} icon={Globe}>
              <option value="">{t("common.selectPlaceholder")}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </SelectField>
          </div>
        </div>
      ),
    },
    {
      title: t("vehicles.sectionExtra"),
      description: t("vehicles.sectionExtraDesc"),
      badge: "required" as const,
      accentColor: "sky",
      isValid: () => !!(form.lengthM.trim() && form.widthM.trim() && form.heightM.trim() && form.weightKg.trim()),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("vehicles.lengthM")} <span className="text-company-primary">*</span></label>
            <div className="relative group">
              <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                value={form.lengthM}
                onChange={(e) => setForm((p) => ({ ...p, lengthM: e.target.value }))}
                placeholder={t("vehicles.lengthM")}
                className={IL_UNIT}
                aria-invalid={!!errors.lengthM}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">
                m
              </span>
            </div>
            <div className="min-h-[1.25rem] mt-1">
              {errors.lengthM && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.lengthM}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.widthM")} <span className="text-company-primary">*</span></label>
            <div className="relative group">
              <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                value={form.widthM}
                onChange={(e) => setForm((p) => ({ ...p, widthM: e.target.value }))}
                placeholder={t("vehicles.widthM")}
                className={IL_UNIT}
                aria-invalid={!!errors.widthM}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">
                m
              </span>
            </div>
            <div className="min-h-[1.25rem] mt-1">
              {errors.widthM && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.widthM}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.heightM")} <span className="text-company-primary">*</span></label>
            <div className="relative group">
              <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                value={form.heightM}
                onChange={(e) => setForm((p) => ({ ...p, heightM: e.target.value }))}
                placeholder={t("vehicles.heightM")}
                className={IL_UNIT}
                aria-invalid={!!errors.heightM}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">
                m
              </span>
            </div>
            <div className="min-h-[1.25rem] mt-1">
              {errors.heightM && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.heightM}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("vehicles.weightKg")} <span className="text-company-primary">*</span></label>
            <div className="relative group">
              <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={form.weightKg}
                onChange={(e) => setForm((p) => ({ ...p, weightKg: e.target.value }))}
                placeholder={t("vehicles.weightKg")}
                className={IL_UNIT}
                aria-invalid={!!errors.weightKg}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">
                kg
              </span>
            </div>
            <div className="min-h-[1.25rem] mt-1">
              {errors.weightKg && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.weightKg}
                </p>
              )}
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
          if (d) {
            setForm((p) => ({
              ...p,
              lengthM: d.lengthCm != null ? String(Number((d.lengthCm / 100).toFixed(2))) : p.lengthM,
              widthM: d.widthCm != null ? String(Number((d.widthCm / 100).toFixed(2))) : p.widthM,
              heightM: d.heightCm != null ? String(Number((d.heightCm / 100).toFixed(2))) : p.heightM,
              weightKg:
                d.weightKg != null
                  ? String(Number(d.weightKg.toFixed(1)))
                  : p.weightKg,
            }));
          }
        }
      }}
      error={error}
    />
  );
}
