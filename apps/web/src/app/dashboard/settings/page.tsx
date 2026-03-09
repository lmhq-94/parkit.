"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Palette, Loader2, ArrowRight, Upload, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useDashboardStore } from "@/lib/store";
import { FormPageSkeleton } from "@/components/FormPageSkeleton";

type BrandingConfig = {
  bannerImageUrl?: string | null;
  logoImageUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};

const defaultForm: BrandingConfig = {
  bannerImageUrl: "",
  logoImageUrl: "",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
};

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Error al leer la imagen"));
    r.readAsDataURL(file);
  });
}

function ImageSelector({
  value,
  onChange,
  onClear,
  label,
  description,
  aspectRatio,
  previewClass,
  selectLabel,
  changeLabel,
  removeLabel,
  objectFit = "cover",
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  onClear: () => void;
  label: string;
  description?: string;
  aspectRatio: string;
  previewClass?: string;
  selectLabel: string;
  changeLabel: string;
  removeLabel: string;
  objectFit?: "cover" | "contain";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
    } catch {
      // ignore
    }
    e.target.value = "";
  };
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {description && <p className="text-xs text-text-muted mb-1.5">{description}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="space-y-2">
          <div className={`rounded-lg overflow-hidden border border-card-border bg-input-bg ${previewClass || ""}`} style={{ aspectRatio }}>
            <img src={value} alt="" className={`w-full h-full ${objectFit === "contain" ? "object-contain" : "object-cover"}`} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline">
              {changeLabel}
            </button>
            <button type="button" onClick={onClear} className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-red-600 dark:hover:text-red-400 transition-colors">
              <X className="w-3.5 h-3.5" />
              {removeLabel}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border-2 border-dashed border-input-border bg-input-bg hover:border-sky-500/50 hover:bg-sky-500/5 transition-colors flex flex-col items-center justify-center gap-2 py-8 px-4"
        >
          <Upload className="w-8 h-8 text-text-muted" />
          <span className="text-sm font-medium text-text-secondary">{selectLabel}</span>
        </button>
      )}
    </div>
  );
}

function parseHexColor(value: string, fallback: string): string {
  const hex = value.replace(/^#/, "").trim();
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) return `#${hex}`;
  if (/^[0-9A-Fa-f]{3}$/.test(hex)) return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  return fallback;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const setCompanyBranding = useDashboardStore((s) => s.setCompanyBranding);
  const [form, setForm] = useState<BrandingConfig>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiClient.get<{ brandingConfig?: BrandingConfig | null }>("/companies/me");
        if (!cancelled && data?.brandingConfig && typeof data.brandingConfig === "object") {
          const bc = data.brandingConfig as BrandingConfig;
          setForm({
            bannerImageUrl: bc.bannerImageUrl ?? "",
            logoImageUrl: bc.logoImageUrl ?? "",
            primaryColor: bc.primaryColor && /^#[0-9A-Fa-f]{3,6}$/.test(bc.primaryColor) ? bc.primaryColor : defaultForm.primaryColor,
            secondaryColor: bc.secondaryColor && /^#[0-9A-Fa-f]{3,6}$/.test(bc.secondaryColor) ? bc.secondaryColor : defaultForm.secondaryColor,
          });
        }
      } catch {
        if (!cancelled) setError(t("settings.saveError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const primaryColor = form.primaryColor?.trim() ? parseHexColor(form.primaryColor, defaultForm.primaryColor!) : null;
      const secondaryColor = form.secondaryColor?.trim() ? parseHexColor(form.secondaryColor, defaultForm.secondaryColor!) : null;
      await apiClient.patch("/companies/me", {
        brandingConfig: {
          bannerImageUrl: form.bannerImageUrl?.trim() || null,
          logoImageUrl: form.logoImageUrl?.trim() || null,
          primaryColor: primaryColor || null,
          secondaryColor: secondaryColor || null,
        },
      });
      setCompanyBranding({
        bannerImageUrl: form.bannerImageUrl?.trim() || null,
        logoImageUrl: form.logoImageUrl?.trim() || null,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null,
      });
      setSuccess(true);
    } catch {
      setError(t("settings.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FormPageSkeleton />;

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {t("settings.saveSuccess")}
        </div>
      )}

      {/* Sección 1 — Imágenes (igual que empleados: violet + optional) */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-violet-500/8 to-transparent flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("settings.companyTheme")}</p>
            <p className="text-xs text-text-muted">{t("settings.companyThemeDescription")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-text-muted/60 bg-input-bg px-2.5 py-1 rounded-full border border-input-border/60">{t("common.optionalBadge")}</span>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ImageSelector
              value={form.bannerImageUrl ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, bannerImageUrl: v }))}
              onClear={() => setForm((p) => ({ ...p, bannerImageUrl: "" }))}
              label={t("settings.bannerImage")}
              description={t("settings.bannerImageDescription")}
              aspectRatio="6/1"
              previewClass="max-h-28"
              selectLabel={t("settings.selectImage")}
              changeLabel={t("settings.changeImage")}
              removeLabel={t("settings.removeImage")}
            />
            <ImageSelector
              value={form.logoImageUrl ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, logoImageUrl: v }))}
              onClear={() => setForm((p) => ({ ...p, logoImageUrl: "" }))}
              label={t("settings.logoImage")}
              description={t("settings.logoImageDescription")}
              aspectRatio="1/1"
              previewClass="max-h-32"
              objectFit="contain"
              selectLabel={t("settings.selectImage")}
              changeLabel={t("settings.changeImage")}
              removeLabel={t("settings.removeImage")}
            />
          </div>
        </div>
      </div>

      {/* Sección 2 — Colores (igual que empleados: indigo + optional) */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500/8 to-transparent flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("settings.sectionColors")}</p>
            <p className="text-xs text-text-muted">{t("settings.sectionColorsDesc")}</p>
          </div>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Color principal */}
            <div className="flex flex-col gap-2">
              <label className={LABEL}>{t("settings.primaryColor")}</label>
              <p className="text-xs text-text-muted">{t("settings.primaryColorDescription")}</p>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  value={form.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(form.primaryColor) ? form.primaryColor : "#2563eb"}
                  onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                  className="w-12 h-12 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0"
                  title={t("settings.primaryColor")}
                />
                <input
                  type="text"
                  value={form.primaryColor ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                  placeholder={t("settings.primaryColorPlaceholder")}
                  className={`${IL} flex-1 min-w-0 max-w-[140px] font-mono text-sm`}
                />
              </div>
            </div>
            {/* Color secundario */}
            <div className="flex flex-col gap-2">
              <label className={LABEL}>{t("settings.secondaryColor")}</label>
              <p className="text-xs text-text-muted">{t("settings.secondaryColorDescription")}</p>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  value={form.secondaryColor && /^#[0-9A-Fa-f]{6}$/.test(form.secondaryColor) ? form.secondaryColor : "#64748b"}
                  onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))}
                  className="w-12 h-12 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0"
                  title={t("settings.secondaryColor")}
                />
                <input
                  type="text"
                  value={form.secondaryColor ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))}
                  placeholder={t("settings.secondaryColorPlaceholder")}
                  className={`${IL} flex-1 min-w-0 max-w-[140px] font-mono text-sm`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.optionalNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/dashboard"
            className="px-5 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors"
          >
            {t("common.cancel")}
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("common.saving")}</> : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
