"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Hash, Globe, ArrowRight, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { useDashboardStore } from "@/lib/store";
import { PageLoader } from "@/components/PageLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SelectField } from "@/components/SelectField";
import { BrandModelComboField } from "@/components/BrandModelComboField";
import { COUNTRIES } from "@/lib/companyOptions";
import { formatPlate, toTitleCase } from "@/lib/inputMasks";
import { required, selectRequired } from "@/lib/validation";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

type CatalogMake = { id: number; name: string };
type CatalogModel = { id: number; name: string };

/** Customers (users with CUSTOMER role) - same list as dashboard Customers page */
type CustomerOption = { id: string; firstName?: string; lastName?: string; email?: string };
type OwnerRef = { client?: { id: string; userId?: string; user?: { id?: string } } };

const defaultForm = {
  plate: "",
  brand: "",
  model: "",
  year: "",
  countryCode: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  clientId: "",
};

export default function EditVehiclePage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const selectedCompanyId = useDashboardStore((s: { selectedCompanyId: string | null }) => s.selectedCompanyId);
  const [form, setForm] = useState(defaultForm);
  const [initialForm, setInitialForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [makes, setMakes] = useState<CatalogMake[]>([]);
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.get<Record<string, unknown> & { owners?: OwnerRef[] }>(`/vehicles/${id}`);
        if (data) {
          const dims = data.dimensions as { lengthCm?: number; widthCm?: number; heightCm?: number } | null | undefined;
          const owners = data.owners as OwnerRef[] | undefined;
          const firstOwner = Array.isArray(owners) && owners.length > 0 ? owners[0]?.client : undefined;
          const firstOwnerId = firstOwner?.user?.id ?? firstOwner?.userId ?? firstOwner?.id ?? "";
          const loaded = {
            plate: formatPlate(String(data.plate ?? "")),
            brand: String(data.brand ?? ""),
            model: String(data.model ?? ""),
            year: data.year != null ? String(data.year) : "",
            countryCode: String(data.countryCode ?? ""),
            lengthCm: dims?.lengthCm != null ? String(dims.lengthCm) : "",
            widthCm: dims?.widthCm != null ? String(dims.widthCm) : "",
            heightCm: dims?.heightCm != null ? String(dims.heightCm) : "",
            clientId: firstOwnerId,
          };
          setForm(loaded);
          setInitialForm(loaded);
        }
      } catch {
        setError(t("common.loadingData"));
        showError(t("common.loadError"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
    (async () => {
      try {
        const url = form.year.trim()
          ? `/vehicles/catalog/makes?year=${encodeURIComponent(form.year)}`
          : "/vehicles/catalog/makes";
        const data = await apiClient.get<CatalogMake[]>(url);
        setMakes(Array.isArray(data) ? data : []);
      } catch {
        setMakes([]);
      }
    })();
  }, [form.year]);

  useEffect(() => {
    if (!form.brand.trim()) {
      setModels([]);
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
      } catch {
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    })();
    // Solo al cambiar marca: no refetch al escribir año para no perder el modelo elegido
  }, [form.brand]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const setBrand = useCallback((v: string) => {
    setForm((p) => ({ ...p, brand: v, model: "" }));
  }, []);

  const brandInCatalog = makes.some(
    (m) => m.name.toLowerCase() === form.brand.trim().toLowerCase()
  );

  useEffect(() => {
    if (loading || !form.brand.trim() || !form.model.trim()) return;
    const q = new URLSearchParams({ make: form.brand, model: form.model });
    if (form.year.trim()) q.set("year", form.year);
    apiClient
      .get<{ lengthCm?: number; widthCm?: number; heightCm?: number }>(
        `/vehicles/catalog/dimensions?${q.toString()}`
      )
      .then((d) => {
        if (d && (d.lengthCm != null || d.widthCm != null || d.heightCm != null)) {
          setForm((p) => ({
            ...p,
            lengthCm: d.lengthCm != null ? String(d.lengthCm) : p.lengthCm,
            widthCm: d.widthCm != null ? String(d.widthCm) : p.widthCm,
            heightCm: d.heightCm != null ? String(d.heightCm) : p.heightCm,
          }));
        }
      })
      .catch(() => {});
  }, [loading, form.brand, form.model, form.year]);

  const handleSubmit = async () => {
    const nextErrors: Partial<Record<keyof typeof defaultForm, string>> = {};
    const clientError = selectRequired(t, form.clientId);
    if (clientError) nextErrors.clientId = clientError;
    const yearError = required(t, form.year);
    if (yearError) nextErrors.year = yearError;
    if (!form.plate.trim()) nextErrors.plate = required(t, form.plate) ?? "";
    if (!form.brand.trim()) nextErrors.brand = required(t, form.brand) ?? "";
    if (!form.model.trim()) nextErrors.model = required(t, form.model) ?? "";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitting(true); setError(null);
    try {
      const dimensions =
        form.lengthCm !== "" || form.widthCm !== "" || form.heightCm !== ""
          ? {
              ...(form.lengthCm !== "" && { lengthCm: Number(form.lengthCm) }),
              ...(form.widthCm !== "" && { widthCm: Number(form.widthCm) }),
              ...(form.heightCm !== "" && { heightCm: Number(form.heightCm) }),
            }
          : undefined;
      await apiClient.patch(`/vehicles/${id}`, {
        plate: form.plate.trim().toUpperCase(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        countryCode: form.countryCode.trim() || undefined,
        ...(dimensions !== undefined && { dimensions }),
      });
      if (form.clientId.trim() && form.clientId !== initialForm.clientId) {
        try {
          await apiClient.post(`/users/${form.clientId.trim()}/vehicles`, {
            vehicleId: id,
            isPrimary: true,
          });
        } catch {
          // Si ya está asignado o falla la asignación, no bloqueamos el guardado del vehículo
        }
      }
      showSuccess(t("common.saveSuccessShort"));
      router.push("/dashboard/vehicles");
    } catch (err) {
      const msg = getTranslatedApiErrorMessage(err, t) || t("apiErrors.requestFailed");
      setError(msg);
      showError(msg);
    } finally { setSubmitting(false); }
  };

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm]
  );
  const isValid =
    form.plate.trim() &&
    form.brand.trim() &&
    form.model.trim() &&
    !!form.clientId.trim();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[200px]">
        <PageLoader />
      </div>
    );
  }

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
            <p className="text-sm font-semibold text-text-primary">{t("vehicles.sectionMain")}</p>
            <span className="text-[11px] font-medium text-red-500">{t("common.requiredBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("vehicles.sectionMainDesc")}</p>
        </div>
        <div className="p-6 pt-4">
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
                onChange={setBrand}
                options={makes.map((m) => ({ value: m.name, label: toTitleCase(m.name) }))}
                loading={false}
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
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("vehicles.sectionExtra")}</p>
            <span className="text-[11px] font-medium text-text-muted">{t("common.optionalBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("vehicles.sectionExtraDesc")}</p>
        </div>
        <div className="p-6 pt-4">
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
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/vehicles"
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
