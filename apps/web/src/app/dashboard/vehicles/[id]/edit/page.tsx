"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Hash, Globe, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { FormPageSkeleton } from "@/components/FormPageSkeleton";
import { SelectField } from "@/components/SelectField";
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
  countryCode: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
};

export default function EditVehiclePage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [makes, setMakes] = useState<CatalogMake[]>([]);
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.get<Record<string, unknown>>(`/vehicles/${id}`);
        if (data) {
          const dims = data.dimensions as { lengthCm?: number; widthCm?: number; heightCm?: number } | null | undefined;
          setForm({
            plate: formatPlate(String(data.plate ?? "")),
            brand: String(data.brand ?? ""),
            model: String(data.model ?? ""),
            year: data.year != null ? String(data.year) : "",
            countryCode: String(data.countryCode ?? ""),
            lengthCm: dims?.lengthCm != null ? String(dims.lengthCm) : "",
            widthCm: dims?.widthCm != null ? String(dims.widthCm) : "",
            heightCm: dims?.heightCm != null ? String(dims.heightCm) : "",
          });
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

  const setBrand = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((p) => ({ ...p, brand: e.target.value, model: "" }));
  }, []);

  useEffect(() => {
    if (loading || !form.brand.trim() || !form.model.trim() || !form.year.trim()) return;
    const q = new URLSearchParams({ make: form.brand, model: form.model, year: form.year });
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
    if (!form.plate.trim() || !form.brand.trim() || !form.model.trim()) return;
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
        year: form.year !== "" ? Number(form.year) : undefined,
        countryCode: form.countryCode.trim() || undefined,
        ...(dimensions !== undefined && { dimensions }),
      });
      showSuccess(t("common.saveSuccessShort"));
      router.push("/dashboard/vehicles");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar el vehículo";
      setError(msg);
      showError(msg);
    } finally { setSubmitting(false); }
  };

  const isValid = form.plate.trim() && form.brand.trim() && form.model.trim();

  if (loading) return <FormPageSkeleton />;

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-company-primary-8 to-transparent">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("vehicles.sectionMain")}</p>
            <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">{t("common.requiredBadge")}</span>
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
              <SelectField value={form.brand} onChange={setBrand} icon={Car}>
                <option value="">{t("common.selectPlaceholder")}</option>
                {makes.map((m) => (
                  <option key={m.id} value={m.name}>{toTitleCase(m.name)}</option>
                ))}
              </SelectField>
            </div>
            <div>
              <label className={LABEL}>{t("vehicles.model")} <span className="text-company-primary">*</span></label>
              <SelectField value={form.model} onChange={set("model")} icon={Car}>
                <option value="">{loadingModels ? t("common.loading") : form.brand ? t("common.selectPlaceholder") : t("vehicles.selectBrandFirst")}</option>
                {models.map((m) => (
                  <option key={m.id} value={m.name}>{toTitleCase(m.name)}</option>
                ))}
              </SelectField>
            </div>
            <div>
              <label className={LABEL}>{t("vehicles.year")}</label>
              <div className="relative group">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input type="number" min={1900} max={new Date().getFullYear() + 1} value={form.year} onChange={set("year")} placeholder={t("common.placeholderYear")} className={IL} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-company-primary-8 to-transparent">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("vehicles.sectionExtra")}</p>
            <span className="text-[10px] font-semibold text-text-muted/60 bg-input-bg px-2.5 py-1 rounded-full border border-input-border/60">{t("common.optionalBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("vehicles.sectionExtraDesc")}</p>
        </div>
        <div className="p-6 pt-4">
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
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/vehicles"
            className="px-5 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors">
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={handleSubmit} disabled={submitting || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("common.saving")}</> : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
