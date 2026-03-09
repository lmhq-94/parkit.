"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, Upload, X, Copy, Check, Undo2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useDashboardStore } from "@/lib/store";
import {
  THEME_DEFAULT_PRIMARY_LIGHT,
  THEME_DEFAULT_PRIMARY_DARK,
  THEME_DEFAULT_SECONDARY_LIGHT,
  THEME_DEFAULT_SECONDARY_DARK,
  THEME_DEFAULT_TERTIARY_LIGHT,
  THEME_DEFAULT_TERTIARY_DARK,
} from "@/lib/themeDefaults";
import { FormPageSkeleton } from "@/components/FormPageSkeleton";

type BrandingConfig = {
  bannerImageUrl?: string | null;
  logoImageUrl?: string | null;
  primaryColor?: string | null;
  primaryColorDark?: string | null;
  secondaryColor?: string | null;
  secondaryColorDark?: string | null;
  tertiaryColor?: string | null;
  tertiaryColorDark?: string | null;
};

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
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
  headerClassName,
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
  /** Misma altura de cabecera en todas las columnas para alinear como la sección de colores */
  headerClassName?: string;
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
  const header = (
    <>
      <label className={LABEL}>{label}</label>
      {description && <p className="text-xs text-text-muted mb-1.5">{description}</p>}
    </>
  );
  return (
    <div>
      {headerClassName ? <div className={headerClassName}>{header}</div> : header}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="space-y-2">
          <div className={`rounded-lg overflow-hidden border border-card-border bg-input-bg ${previewClass || ""}`} style={{ aspectRatio }}>
            <img src={value} alt="" className={`w-full h-full ${objectFit === "contain" ? "object-contain" : "object-cover"}`} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="text-sm font-medium text-company-primary hover:underline">
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
          className="w-full rounded-lg border-2 border-dashed border-input-border bg-input-bg hover:border-company-primary-muted hover:bg-company-primary-subtle transition-colors flex flex-col items-center justify-center gap-2 py-8 px-4"
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

function CopyHexButton({ value, id, copiedId, onCopy, copyLabel }: { value: string; id: string; copiedId: string | null; onCopy: (id: string) => void; copyLabel: string }) {
  const hex = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : value.trim() ? value : "";
  const showCheck = copiedId === id;
  return (
    <button
      type="button"
      onClick={() => {
        if (hex && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(hex);
          onCopy(id);
        }
      }}
      disabled={!hex}
      className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-input-bg transition-colors disabled:opacity-40 disabled:pointer-events-none"
      title={copyLabel}
      aria-label={copyLabel}
    >
      {showCheck ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const setCompanyBranding = useDashboardStore((s) => s.setCompanyBranding);
  const [form, setForm] = useState<BrandingConfig>({
    bannerImageUrl: "",
    logoImageUrl: "",
    primaryColor: THEME_DEFAULT_PRIMARY_LIGHT,
    primaryColorDark: THEME_DEFAULT_PRIMARY_DARK,
    secondaryColor: THEME_DEFAULT_SECONDARY_LIGHT,
    secondaryColorDark: THEME_DEFAULT_SECONDARY_DARK,
    tertiaryColor: THEME_DEFAULT_TERTIARY_LIGHT,
    tertiaryColorDark: THEME_DEFAULT_TERTIARY_DARK,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyHex = (id: string) => {
    setCopiedId(id);
  };
  useEffect(() => {
    if (!copiedId) return;
    const t = setTimeout(() => setCopiedId(null), 1500);
    return () => clearTimeout(t);
  }, [copiedId]);

  // Cargar branding solo al montar; [t] provocaba re-ejecución y reseteaba colores/imagen al cambiar el formulario
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
            primaryColor: bc.primaryColor ?? THEME_DEFAULT_PRIMARY_LIGHT,
            primaryColorDark: bc.primaryColorDark ?? THEME_DEFAULT_PRIMARY_DARK,
            secondaryColor: bc.secondaryColor ?? THEME_DEFAULT_SECONDARY_LIGHT,
            secondaryColorDark: bc.secondaryColorDark ?? THEME_DEFAULT_SECONDARY_DARK,
            tertiaryColor: bc.tertiaryColor ?? THEME_DEFAULT_TERTIARY_LIGHT,
            tertiaryColorDark: bc.tertiaryColorDark ?? THEME_DEFAULT_TERTIARY_DARK,
          });
        }
      } catch {
        if (!cancelled) setError(t("settings.saveError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial única para no pisar cambios del usuario
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const primaryColor = form.primaryColor?.trim()
        ? parseHexColor(form.primaryColor, THEME_DEFAULT_PRIMARY_LIGHT)
        : null;
      const primaryColorDark = form.primaryColorDark?.trim()
        ? parseHexColor(form.primaryColorDark, THEME_DEFAULT_PRIMARY_DARK)
        : null;
      const secondaryColor = form.secondaryColor?.trim()
        ? parseHexColor(form.secondaryColor, THEME_DEFAULT_SECONDARY_LIGHT)
        : null;
      const secondaryColorDark = form.secondaryColorDark?.trim()
        ? parseHexColor(form.secondaryColorDark, THEME_DEFAULT_SECONDARY_DARK)
        : null;
      const tertiaryColor = form.tertiaryColor?.trim()
        ? parseHexColor(form.tertiaryColor, THEME_DEFAULT_TERTIARY_LIGHT)
        : null;
      const tertiaryColorDark = form.tertiaryColorDark?.trim()
        ? parseHexColor(form.tertiaryColorDark, THEME_DEFAULT_TERTIARY_DARK)
        : null;
      await apiClient.patch("/companies/me", {
        brandingConfig: {
          bannerImageUrl: form.bannerImageUrl?.trim() || null,
          logoImageUrl: form.logoImageUrl?.trim() || null,
          primaryColor: primaryColor || null,
          primaryColorDark: primaryColorDark || null,
          secondaryColor: secondaryColor || null,
          secondaryColorDark: secondaryColorDark || null,
          tertiaryColor: tertiaryColor || null,
          tertiaryColorDark: tertiaryColorDark || null,
        },
      });
      setCompanyBranding({
        bannerImageUrl: form.bannerImageUrl?.trim() || null,
        logoImageUrl: form.logoImageUrl?.trim() || null,
        primaryColor: primaryColor || null,
        primaryColorDark: primaryColorDark || null,
        secondaryColor: secondaryColor || null,
        secondaryColorDark: secondaryColorDark || null,
        tertiaryColor: tertiaryColor || null,
        tertiaryColorDark: tertiaryColorDark || null,
      });
      setSuccess(true);
    } catch {
      setError(t("settings.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevertToDefault = async () => {
    setReverting(true);
    setError(null);
    setSuccess(false);
    try {
      await apiClient.patch("/companies/me", {
        brandingConfig: {
          bannerImageUrl: null,
          logoImageUrl: null,
          primaryColor: THEME_DEFAULT_PRIMARY_LIGHT,
          primaryColorDark: THEME_DEFAULT_PRIMARY_DARK,
          secondaryColor: THEME_DEFAULT_SECONDARY_LIGHT,
          secondaryColorDark: THEME_DEFAULT_SECONDARY_DARK,
          tertiaryColor: THEME_DEFAULT_TERTIARY_LIGHT,
          tertiaryColorDark: THEME_DEFAULT_TERTIARY_DARK,
        },
      });
      setCompanyBranding({
        bannerImageUrl: null,
        logoImageUrl: null,
        primaryColor: THEME_DEFAULT_PRIMARY_LIGHT,
        primaryColorDark: THEME_DEFAULT_PRIMARY_DARK,
        secondaryColor: THEME_DEFAULT_SECONDARY_LIGHT,
        secondaryColorDark: THEME_DEFAULT_SECONDARY_DARK,
        tertiaryColor: THEME_DEFAULT_TERTIARY_LIGHT,
        tertiaryColorDark: THEME_DEFAULT_TERTIARY_DARK,
      });
      setForm({
        bannerImageUrl: "",
        logoImageUrl: "",
        primaryColor: THEME_DEFAULT_PRIMARY_LIGHT,
        primaryColorDark: THEME_DEFAULT_PRIMARY_DARK,
        secondaryColor: THEME_DEFAULT_SECONDARY_LIGHT,
        secondaryColorDark: THEME_DEFAULT_SECONDARY_DARK,
        tertiaryColor: THEME_DEFAULT_TERTIARY_LIGHT,
        tertiaryColorDark: THEME_DEFAULT_TERTIARY_DARK,
      });
      setSuccess(true);
    } catch {
      setError(t("settings.saveError"));
    } finally {
      setReverting(false);
    }
  };

  if (loading) return <FormPageSkeleton />;

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 w-full gap-5">
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
        <div className="px-6 py-4 bg-gradient-to-r from-violet-500/8 to-transparent">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("settings.companyTheme")}</p>
            <span className="text-[10px] font-semibold text-company-secondary bg-company-secondary-subtle px-2.5 py-1 rounded-full border border-company-secondary-muted">{t("common.optionalBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("settings.companyThemeDescription")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-5 items-start">
            {/* Logo / avatar de la empresa (columna fija, alineada) */}
            <div className="min-w-0">
              <ImageSelector
                value={form.logoImageUrl ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, logoImageUrl: v }))}
                onClear={() => setForm((p) => ({ ...p, logoImageUrl: "" }))}
                label={t("settings.logoImage")}
                description={t("settings.logoImageDescription")}
                aspectRatio="1/1"
                previewClass="max-h-24 sm:max-h-28 w-24 sm:w-32 mx-auto sm:mx-0"
                objectFit="contain"
                selectLabel={t("settings.selectImage")}
                changeLabel={t("settings.changeImage")}
                removeLabel={t("settings.removeImage")}
                headerClassName="min-h-[60px]"
              />
            </div>
            {/* Banner (ocupa el resto del espacio, alineado como en Colores) */}
            <div className="min-w-0">
              <ImageSelector
                value={form.bannerImageUrl ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, bannerImageUrl: v }))}
                onClear={() => setForm((p) => ({ ...p, bannerImageUrl: "" }))}
                label={t("settings.bannerImage")}
                description={t("settings.bannerImageDescription")}
                aspectRatio="6/1"
                previewClass="max-h-32 sm:max-h-40 w-full"
                selectLabel={t("settings.selectImage")}
                changeLabel={t("settings.changeImage")}
                removeLabel={t("settings.removeImage")}
                headerClassName="min-h-[60px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección 2 — Colores (sin bordes; header igual que la sección de imágenes) */}
      <div className="bg-card/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-violet-500/8 to-transparent flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("settings.sectionColors")}</p>
            <p className="text-xs text-text-muted">{t("settings.sectionColorsDesc")}</p>
          </div>
        </div>
        <div className="px-6 pb-6 pt-2">
          {/* Grid de 3 columnas iguales para alinear los cuadros de color verticalmente */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6 sm:gap-y-0">
            {/* Principal */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="min-h-[60px]">
                <label className={LABEL}>{t("settings.primaryColor")}</label>
                <p className="text-xs text-text-muted">{t("settings.primaryColorDescription")}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-[4.5rem] shrink-0">{t("settings.forLightMode")}</span>
                  <input
                    type="color"
                    value={form.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(form.primaryColor) ? form.primaryColor : THEME_DEFAULT_PRIMARY_LIGHT}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0"
                    title={t("settings.primaryColor")}
                  />
                  <input
                    type="text"
                    value={form.primaryColor ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    placeholder={t("settings.primaryColorPlaceholder")}
                    className={`${IL} w-24 min-w-0 font-mono text-sm py-2 pl-3 pr-2`}
                    aria-label={`${t("settings.primaryColor")} ${t("settings.forLightMode")}`}
                  />
                  <CopyHexButton value={form.primaryColor ?? THEME_DEFAULT_PRIMARY_LIGHT} id="primary-light" copiedId={copiedId} onCopy={handleCopyHex} copyLabel={t("settings.copyHex")} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-[4.5rem] shrink-0">{t("settings.forDarkMode")}</span>
                  <input
                    type="color"
                    value={form.primaryColorDark && /^#[0-9A-Fa-f]{6}$/.test(form.primaryColorDark) ? form.primaryColorDark : THEME_DEFAULT_PRIMARY_DARK}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColorDark: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0"
                    title={t("settings.primaryColor")}
                  />
                  <input
                    type="text"
                    value={form.primaryColorDark ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColorDark: e.target.value }))}
                    placeholder="#3b82f6"
                    className={`${IL} w-24 min-w-0 font-mono text-sm py-2 pl-3 pr-2`}
                    aria-label={`${t("settings.primaryColor")} ${t("settings.forDarkMode")}`}
                  />
                  <CopyHexButton value={form.primaryColorDark ?? THEME_DEFAULT_PRIMARY_DARK} id="primary-dark" copiedId={copiedId} onCopy={handleCopyHex} copyLabel={t("settings.copyHex")} />
                </div>
              </div>
            </div>
            {/* Secundario */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="min-h-[60px]">
                <label className={LABEL}>{t("settings.secondaryColor")}</label>
                <p className="text-xs text-text-muted">{t("settings.secondaryColorDescription")}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-[4.5rem] shrink-0">{t("settings.forLightMode")}</span>
                  <input
                    type="color"
                    value={form.secondaryColor && /^#[0-9A-Fa-f]{6}$/.test(form.secondaryColor) ? form.secondaryColor : THEME_DEFAULT_SECONDARY_LIGHT}
                    onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0"
                    title={t("settings.secondaryColor")}
                  />
                  <input
                    type="text"
                    value={form.secondaryColor ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))}
                    placeholder={t("settings.secondaryColorPlaceholder")}
                    className={`${IL} w-24 min-w-0 font-mono text-sm py-2 pl-3 pr-2`}
                    aria-label={`${t("settings.secondaryColor")} ${t("settings.forLightMode")}`}
                  />
                  <CopyHexButton value={form.secondaryColor ?? THEME_DEFAULT_SECONDARY_LIGHT} id="secondary-light" copiedId={copiedId} onCopy={handleCopyHex} copyLabel={t("settings.copyHex")} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-[4.5rem] shrink-0">{t("settings.forDarkMode")}</span>
                  <input
                    type="color"
                    value={form.secondaryColorDark && /^#[0-9A-Fa-f]{6}$/.test(form.secondaryColorDark) ? form.secondaryColorDark : THEME_DEFAULT_SECONDARY_DARK}
                    onChange={(e) => setForm((p) => ({ ...p, secondaryColorDark: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0"
                    title={t("settings.secondaryColor")}
                  />
                  <input
                    type="text"
                    value={form.secondaryColorDark ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, secondaryColorDark: e.target.value }))}
                    placeholder="#94a3b8"
                    className={`${IL} w-24 min-w-0 font-mono text-sm py-2 pl-3 pr-2`}
                    aria-label={`${t("settings.secondaryColor")} ${t("settings.forDarkMode")}`}
                  />
                  <CopyHexButton value={form.secondaryColorDark ?? THEME_DEFAULT_SECONDARY_DARK} id="secondary-dark" copiedId={copiedId} onCopy={handleCopyHex} copyLabel={t("settings.copyHex")} />
                </div>
              </div>
            </div>
            {/* Terciario */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="min-h-[60px]">
                <label className={LABEL}>{t("settings.tertiaryColor")}</label>
                <p className="text-xs text-text-muted">{t("settings.tertiaryColorDescription")}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-[4.5rem] shrink-0">{t("settings.forLightMode")}</span>
                  <input
                    type="color"
                    value={form.tertiaryColor && /^#[0-9A-Fa-f]{6}$/.test(form.tertiaryColor) ? form.tertiaryColor : THEME_DEFAULT_TERTIARY_LIGHT}
                    onChange={(e) => setForm((p) => ({ ...p, tertiaryColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0"
                    title={t("settings.tertiaryColor")}
                  />
                  <input
                    type="text"
                    value={form.tertiaryColor ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, tertiaryColor: e.target.value }))}
                    placeholder={t("settings.tertiaryColorPlaceholder")}
                    className={`${IL} w-24 min-w-0 font-mono text-sm py-2 pl-3 pr-2`}
                    aria-label={`${t("settings.tertiaryColor")} ${t("settings.forLightMode")}`}
                  />
                  <CopyHexButton value={form.tertiaryColor ?? THEME_DEFAULT_TERTIARY_LIGHT} id="tertiary-light" copiedId={copiedId} onCopy={handleCopyHex} copyLabel={t("settings.copyHex")} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-[4.5rem] shrink-0">{t("settings.forDarkMode")}</span>
                  <input
                    type="color"
                    value={form.tertiaryColorDark && /^#[0-9A-Fa-f]{6}$/.test(form.tertiaryColorDark) ? form.tertiaryColorDark : THEME_DEFAULT_TERTIARY_DARK}
                    onChange={(e) => setForm((p) => ({ ...p, tertiaryColorDark: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0"
                    title={t("settings.tertiaryColor")}
                  />
                  <input
                    type="text"
                    value={form.tertiaryColorDark ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, tertiaryColorDark: e.target.value }))}
                    placeholder="#cbd5e1"
                    className={`${IL} w-24 min-w-0 font-mono text-sm py-2 pl-3 pr-2`}
                    aria-label={`${t("settings.tertiaryColor")} ${t("settings.forDarkMode")}`}
                  />
                  <CopyHexButton value={form.tertiaryColorDark ?? THEME_DEFAULT_TERTIARY_DARK} id="tertiary-dark" copiedId={copiedId} onCopy={handleCopyHex} copyLabel={t("settings.copyHex")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2 flex-wrap">
        <button
          type="button"
          onClick={handleRevertToDefault}
          disabled={reverting || submitting}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-1.5"
        >
          {reverting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          ) : (
            <Undo2 className="w-3.5 h-3.5 shrink-0" />
          )}
          {t("settings.revertToDefault")}
        </button>
        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/dashboard"
            className="px-5 py-3 rounded-lg border border-company-secondary-muted text-sm font-medium text-company-secondary hover:bg-company-secondary-subtle hover:text-company-secondary transition-colors"
          >
            {t("common.cancel")}
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("common.saving")}</> : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
