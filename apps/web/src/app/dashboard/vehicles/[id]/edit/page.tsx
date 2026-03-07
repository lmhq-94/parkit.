"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Hash, Globe, Tag, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { FormPageSkeleton } from "@/components/FormPageSkeleton";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

const defaultForm = { plate: "", brand: "", model: "", year: "", countryCode: "" };

export default function EditVehiclePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.get<Record<string, unknown>>(`/vehicles/${id}`);
        if (data) {
          setForm({
            plate: String(data.plate ?? ""),
            brand: String(data.brand ?? ""),
            model: String(data.model ?? ""),
            year: data.year != null ? String(data.year) : "",
            countryCode: String(data.countryCode ?? ""),
          });
        }
      } catch {
        setError(t("common.loadingData"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.plate.trim() || !form.brand.trim() || !form.model.trim()) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.patch(`/vehicles/${id}`, {
        plate: form.plate.trim().toUpperCase(),
        brand: form.brand.trim(), model: form.model.trim(),
        year: form.year !== "" ? Number(form.year) : undefined,
        countryCode: form.countryCode.trim() || undefined,
      });
      router.push("/dashboard/vehicles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el vehículo");
    } finally { setSubmitting(false); }
  };

  const isValid = form.plate.trim() && form.brand.trim() && form.model.trim();

  if (loading) return <FormPageSkeleton />;

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500/8 to-transparent flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("vehicles.sectionMain")}</p>
            <p className="text-xs text-text-muted">{t("vehicles.sectionMainDesc")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">{t("common.requiredBadge")}</span>
        </div>
        <div className="p-6 pt-4">
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
        </div>
      </div>

      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-sky-500/8 to-transparent flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("vehicles.sectionExtra")}</p>
            <p className="text-xs text-text-muted">{t("vehicles.sectionExtraDesc")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-text-muted/60 bg-input-bg px-2.5 py-1 rounded-full border border-input-border/60">{t("common.optionalBadge")}</span>
        </div>
        <div className="p-6 pt-4">
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("common.saving")}</> : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
