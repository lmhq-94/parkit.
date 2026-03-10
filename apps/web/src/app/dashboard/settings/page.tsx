"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check, Undo2 } from "lucide-react";
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
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageLoader } from "@/components/PageLoader";
import { ImageCropField } from "@/components/ImageCropField";
import { useToast } from "@/lib/toastStore";

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
  const { showSuccess, showError } = useToast();
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
  const [loadError, setLoadError] = useState<string | null>(null);
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
        if (!cancelled) setLoadError(t("settings.saveError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial única para no pisar cambios del usuario
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
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
      showSuccess(t("settings.saveSuccess"));
    } catch {
      showError(t("settings.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevertToDefault = async () => {
    setReverting(true);
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
      showSuccess(t("settings.saveSuccess"));
    } catch {
      showError(t("settings.saveError"));
    } finally {
      setReverting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col pt-14 pb-8 px-4 md:px-10 lg:px-12 w-full">
        <div className="flex flex-1 items-center justify-center">
          <PageLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 pt-6 pb-8 px-4 md:px-10 lg:px-12 w-full">
      {loadError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400 shrink-0">
          {loadError}
        </div>
      )}

      {/* Contenido con scroll interno: así la página no crece y el scroll queda dentro */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
      {/* En xl las dos secciones van lado a lado para reducir altura */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8 items-start">
        {/* Sección 1 — Tema de la empresa (Logo y Banner) */}
        <div className="bg-card/60 rounded-2xl overflow-hidden min-w-0">
          <div className="px-6 py-4 bg-gradient-to-r from-violet-500/8 to-transparent">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-text-primary">{t("settings.companyTheme")}</p>
              <span className="text-[10px] font-semibold text-company-secondary bg-company-secondary-subtle px-2.5 py-1 rounded-full border border-company-secondary-muted">{t("common.optionalBadge")}</span>
            </div>
            <p className="text-xs text-text-muted mt-1 break-words">{t("settings.companyThemeDescription")}</p>
          </div>
          <div className="px-6 pb-6 pt-2">
            <div className="flex flex-col gap-6">
              <ImageCropField
                kind="logo"
                value={form.logoImageUrl ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, logoImageUrl: v }))}
                onClear={() => setForm((p) => ({ ...p, logoImageUrl: "" }))}
                label={t("settings.logoImage")}
                description={t("settings.logoImageDescription")}
                recommendedSize="400 × 400 px"
                layout="row"
                t={t}
              />
              <ImageCropField
                kind="banner"
                value={form.bannerImageUrl ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, bannerImageUrl: v }))}
                onClear={() => setForm((p) => ({ ...p, bannerImageUrl: "" }))}
                label={t("settings.bannerImage")}
                description={t("settings.bannerImageDescription")}
                recommendedSize="1200 × 300 px"
                layout="row"
                t={t}
              />
            </div>
          </div>
        </div>

        {/* Sección 2 — Colores */}
        <div className="bg-card/60 rounded-2xl overflow-hidden min-w-0">
          <div className="px-6 py-4 bg-gradient-to-r from-violet-500/8 to-transparent flex items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">{t("settings.sectionColors")}</p>
              <p className="text-xs text-text-muted">{t("settings.sectionColorsDesc")}</p>
            </div>
          </div>
          <div className="px-6 pb-6 pt-2">
          <div className="flex flex-col gap-6">
            {/* Fila: Principal */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0 border-b border-card-border pb-6 last:border-0 last:pb-0">
              <div className="sm:w-40 shrink-0">
                <label className={LABEL}>{t("settings.primaryColor")}</label>
                <p className="text-xs text-text-muted">{t("settings.primaryColorDescription")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-[4.5rem] shrink-0">{t("settings.forLightMode")}</span>
                  <input type="color" value={form.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(form.primaryColor) ? form.primaryColor : THEME_DEFAULT_PRIMARY_LIGHT} onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0" title={t("settings.primaryColor")} />
                  <input type="text" value={form.primaryColor ?? ""} onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))} placeholder={t("settings.primaryColorPlaceholder")} className={`${IL} w-24 min-w-0 font-mono text-sm py-2 pl-3 pr-2`} aria-label={`${t("settings.primaryColor")} ${t("settings.forLightMode")}`} />
                  <CopyHexButton value={form.primaryColor ?? THEME_DEFAULT_PRIMARY_LIGHT} id="primary-light" copiedId={copiedId} onCopy={handleCopyHex} copyLabel={t("settings.copyHex")} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-[4.5rem] shrink-0">{t("settings.forDarkMode")}</span>
                  <input type="color" value={form.primaryColorDark && /^#[0-9A-Fa-f]{6}$/.test(form.primaryColorDark) ? form.primaryColorDark : THEME_DEFAULT_PRIMARY_DARK} onChange={(e) => setForm((p) => ({ ...p, primaryColorDark: e.target.value }))} className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0" title={t("settings.primaryColor")} />
                  <input type="text" value={form.primaryColorDark ?? ""} onChange={(e) => setForm((p) => ({ ...p, primaryColorDark: e.target.value }))} placeholder="#3b82f6" className={`${IL} w-24 min-w-0 font-mono text-sm py-2 pl-3 pr-2`} aria-label={`${t("settings.primaryColor")} ${t("settings.forDarkMode")}`} />
                  <CopyHexButton value={form.primaryColorDark ?? THEME_DEFAULT_PRIMARY_DARK} id="primary-dark" copiedId={copiedId} onCopy={handleCopyHex} copyLabel={t("settings.copyHex")} />
                </div>
              </div>
            </div>
            {/* Fila: Secundario */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0 border-b border-card-border pb-6 last:border-0 last:pb-0">
              <div className="sm:w-40 shrink-0">
                <label className={LABEL}>{t("settings.secondaryColor")}</label>
                <p className="text-xs text-text-muted">{t("settings.secondaryColorDescription")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-[4.5rem] shrink-0">{t("settings.forLightMode")}</span>
                  <input type="color" value={form.secondaryColor && /^#[0-9A-Fa-f]{6}$/.test(form.secondaryColor) ? form.secondaryColor : THEME_DEFAULT_SECONDARY_LIGHT} onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0" title={t("settings.secondaryColor")} />
                  <input type="text" value={form.secondaryColor ?? ""} onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))} placeholder={t("settings.secondaryColorPlaceholder")} className={`${IL} w-24 min-w-0 font-mono text-sm py-2 pl-3 pr-2`} aria-label={`${t("settings.secondaryColor")} ${t("settings.forLightMode")}`} />
                  <CopyHexButton value={form.secondaryColor ?? THEME_DEFAULT_SECONDARY_LIGHT} id="secondary-light" copiedId={copiedId} onCopy={handleCopyHex} copyLabel={t("settings.copyHex")} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-[4.5rem] shrink-0">{t("settings.forDarkMode")}</span>
                  <input type="color" value={form.secondaryColorDark && /^#[0-9A-Fa-f]{6}$/.test(form.secondaryColorDark) ? form.secondaryColorDark : THEME_DEFAULT_SECONDARY_DARK} onChange={(e) => setForm((p) => ({ ...p, secondaryColorDark: e.target.value }))} className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0" title={t("settings.secondaryColor")} />
                  <input type="text" value={form.secondaryColorDark ?? ""} onChange={(e) => setForm((p) => ({ ...p, secondaryColorDark: e.target.value }))} placeholder="#94a3b8" className={`${IL} w-24 min-w-0 font-mono text-sm py-2 pl-3 pr-2`} aria-label={`${t("settings.secondaryColor")} ${t("settings.forDarkMode")}`} />
                  <CopyHexButton value={form.secondaryColorDark ?? THEME_DEFAULT_SECONDARY_DARK} id="secondary-dark" copiedId={copiedId} onCopy={handleCopyHex} copyLabel={t("settings.copyHex")} />
                </div>
              </div>
            </div>
            {/* Fila: Terciario */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
              <div className="sm:w-40 shrink-0">
                <label className={LABEL}>{t("settings.tertiaryColor")}</label>
                <p className="text-xs text-text-muted">{t("settings.tertiaryColorDescription")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-[4.5rem] shrink-0">{t("settings.forLightMode")}</span>
                  <input type="color" value={form.tertiaryColor && /^#[0-9A-Fa-f]{6}$/.test(form.tertiaryColor) ? form.tertiaryColor : THEME_DEFAULT_TERTIARY_LIGHT} onChange={(e) => setForm((p) => ({ ...p, tertiaryColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0" title={t("settings.tertiaryColor")} />
                  <input type="text" value={form.tertiaryColor ?? ""} onChange={(e) => setForm((p) => ({ ...p, tertiaryColor: e.target.value }))} placeholder={t("settings.tertiaryColorPlaceholder")} className={`${IL} w-24 min-w-0 font-mono text-sm py-2 pl-3 pr-2`} aria-label={`${t("settings.tertiaryColor")} ${t("settings.forLightMode")}`} />
                  <CopyHexButton value={form.tertiaryColor ?? THEME_DEFAULT_TERTIARY_LIGHT} id="tertiary-light" copiedId={copiedId} onCopy={handleCopyHex} copyLabel={t("settings.copyHex")} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-[4.5rem] shrink-0">{t("settings.forDarkMode")}</span>
                  <input type="color" value={form.tertiaryColorDark && /^#[0-9A-Fa-f]{6}$/.test(form.tertiaryColorDark) ? form.tertiaryColorDark : THEME_DEFAULT_TERTIARY_DARK} onChange={(e) => setForm((p) => ({ ...p, tertiaryColorDark: e.target.value }))} className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0" title={t("settings.tertiaryColor")} />
                  <input type="text" value={form.tertiaryColorDark ?? ""} onChange={(e) => setForm((p) => ({ ...p, tertiaryColorDark: e.target.value }))} placeholder="#cbd5e1" className={`${IL} w-24 min-w-0 font-mono text-sm py-2 pl-3 pr-2`} aria-label={`${t("settings.tertiaryColor")} ${t("settings.forDarkMode")}`} />
                  <CopyHexButton value={form.tertiaryColorDark ?? THEME_DEFAULT_TERTIARY_DARK} id="tertiary-dark" copiedId={copiedId} onCopy={handleCopyHex} copyLabel={t("settings.copyHex")} />
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>

      <div className="shrink-0 flex items-center justify-between gap-4 pt-4 flex-wrap border-t border-card-border mt-4 pt-4">
        <button
          type="button"
          onClick={handleRevertToDefault}
          disabled={reverting || submitting}
          className="text-xs text-company-tertiary hover:text-company-secondary transition-colors disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-1.5"
        >
          {reverting ? (
            <LoadingSpinner size="sm" className="shrink-0" />
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
            {submitting ? <><LoadingSpinner size="sm" />{t("common.saving")}</> : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
