"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  Copy,
  Palette,
  ImageIcon,
  Eye,
  Building2,
  UserCircle,
  RotateCcw,
  CheckCircle,
} from "@/lib/premiumIcons";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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

function parseHexColor(value: string, fallback: string): string {
  const hex = value.replace(/^#/, "").trim();
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) return `#${hex}`;
  if (/^[0-9A-Fa-f]{3}$/.test(hex)) return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  return fallback;
}



function ColorInput({
  value,
  onChange,
  label,
  placeholder,
  id,
  copiedId,
  onCopy,
  copyLabel,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  placeholder: string;
  id: string;
  copiedId: string | null;
  onCopy: (id: string) => void;
  copyLabel: string;
}) {
  const validHex = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "";
  const showCheck = copiedId === id;

  return (
    <div className="flex items-center gap-3 bg-card rounded-xl p-2.5 border border-card-border shadow-sm hover:shadow-md hover:border-company-primary/20 transition-all duration-300 group">
      <div className="relative">
        <input
          type="color"
          value={validHex || placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-11 h-11 rounded-xl cursor-pointer border-0 p-0 overflow-hidden opacity-0 absolute inset-0"
          title={label}
        />
        <div
          className="w-11 h-11 rounded-xl border-2 border-white dark:border-slate-700 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: validHex || placeholder }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none"
          aria-label={label}
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (validHex && navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(validHex);
            onCopy(id);
          }
        }}
        disabled={!validHex}
        className="p-2 rounded-lg text-text-muted hover:text-company-primary hover:bg-company-primary/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        title={copyLabel}
      >
        <AnimatePresence mode="wait">
          {showCheck ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
            >
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </motion.div>
          ) : (
            <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Copy className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

function DevicePreviews({ form, t, companyName: _companyName, selectedCompanyId }: { form: BrandingConfig; t: (key: string, vars?: Record<string, string | number>) => string; companyName: string | null; selectedCompanyId: string | null }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const colors = useMemo(() => {
    const primary = parseHexColor(
      isDark ? form.primaryColorDark || "" : form.primaryColor || "",
      isDark ? THEME_DEFAULT_PRIMARY_DARK : THEME_DEFAULT_PRIMARY_LIGHT
    );
    const secondary = parseHexColor(
      isDark ? form.secondaryColorDark || "" : form.secondaryColor || "",
      isDark ? THEME_DEFAULT_SECONDARY_DARK : THEME_DEFAULT_SECONDARY_LIGHT
    );
    const tertiary = parseHexColor(
      isDark ? form.tertiaryColorDark || "" : form.tertiaryColor || "",
      isDark ? THEME_DEFAULT_TERTIARY_DARK : THEME_DEFAULT_TERTIARY_LIGHT
    );
    return { primary, secondary, tertiary };
  }, [form, isDark]);


  return (
    <div className="space-y-10">
      {/* Desktop Preview - Full Row */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-text-muted">{t("settings.desktopView")}</p>
        <div className="rounded-xl border border-card-border overflow-hidden shadow-sm">
          <div className="h-32 relative">
            {form.bannerImageUrl ? (
              <Image
                src={form.bannerImageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="3840px"
              />
            ) : (
              <div className="absolute inset-0 overflow-hidden">
                {/* Base gradient */}
                <div
                  className="absolute inset-0 transition-all duration-700"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a1a 100%)'
                      : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0f2fe 75%, #f0f9ff 100%)',
                  }}
                />

                {/* Blob shapes - scaled for banner preview */}
                <div className="absolute top-0 left-0 w-[300px] h-[300px]" style={{ background: isDark ? 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(15px)', opacity: isDark ? 0.6 : 0.7, animation: 'lava-morph-1 60s ease-in-out infinite' }} />
                <div className="absolute top-1/4 right-0 w-[280px] h-[280px]" style={{ background: isDark ? 'linear-gradient(225deg, #3730a3 0%, #4338ca 50%, #1e3a5f 100%)' : 'linear-gradient(225deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', filter: 'blur(12px)', opacity: isDark ? 0.5 : 0.65, animation: 'lava-morph-2 75s ease-in-out infinite' }} />
                <div className="absolute bottom-0 left-1/4 w-[240px] h-[240px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)' : 'linear-gradient(45deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)', borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%', filter: 'blur(18px)', opacity: isDark ? 0.55 : 0.75, animation: 'lava-morph-3 66s ease-in-out infinite' }} />
                <div className="absolute top-1/2 right-1/4 w-[220px] h-[220px]" style={{ background: isDark ? 'linear-gradient(315deg, #4338ca 0%, #3730a3 50%, #312e81 100%)' : 'linear-gradient(315deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', filter: 'blur(14px)', opacity: isDark ? 0.45 : 0.6, animation: 'lava-morph-4 54s ease-in-out infinite' }} />
                <div className="absolute bottom-1/4 left-0 w-[190px] h-[190px]" style={{ background: isDark ? 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', borderRadius: '50% 50% 40% 60% / 50% 40% 60% 50%', filter: 'blur(11px)', opacity: isDark ? 0.4 : 0.6, animation: 'lava-morph-5 72s ease-in-out infinite' }} />
                <div className="absolute top-1/4 right-1/5 w-[160px] h-[160px]" style={{ background: isDark ? 'linear-gradient(180deg, #4c1d95 0%, #5b21b6 50%, #312e81 100%)' : 'linear-gradient(180deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)', borderRadius: '60% 40% 70% 30% / 40% 60% 30% 70%', filter: 'blur(10px)', opacity: isDark ? 0.35 : 0.65, animation: 'lava-morph-6 84s ease-in-out infinite' }} />
                <div className="absolute bottom-0 left-1/3 w-[140px] h-[140px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e3a8a 0%, #3730a3 100%)' : 'linear-gradient(45deg, #2563eb 0%, #3b82f6 100%)', borderRadius: '40% 60% 50% 50% / 50% 40% 50% 60%', filter: 'blur(9px)', opacity: isDark ? 0.3 : 0.55, animation: 'lava-morph-7 90s ease-in-out infinite' }} />

                {/* Overlay */}
                <div className="absolute inset-0 transition-all duration-700" style={{ background: isDark ? 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,26,0.4) 100%)' : 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)' }} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
          </div>
          <div className="p-5 pt-0">
            <div className="flex items-center gap-4 -mt-10 mb-4">
              <div
                className="w-20 h-20 rounded-full border-[3px] border-card flex items-center justify-center overflow-hidden relative shadow-xl"
                style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', boxShadow: `0 8px 32px -8px ${colors.primary}40` }}
              >
                {form.logoImageUrl ? (
                  <Image src={form.logoImageUrl} alt="" fill className="object-cover" sizes="512px" />
                ) : selectedCompanyId ? (
                  <Building2 className="w-10 h-10" style={{ color: colors.primary }} />
                ) : (
                  <UserCircle className="w-10 h-10" style={{ color: colors.primary }} />
                )}
              </div>
              <div className="flex-1 min-w-0 -mt-1">
              </div>
            </div>
            <div className="flex gap-2">
              <div
                className="h-10 flex-1 rounded-lg shadow-md ring-1 ring-black/5 dark:ring-white/10"
                style={{ backgroundColor: colors.primary }}
              />
              <div
                className="h-10 flex-1 rounded-lg shadow-md ring-1 ring-black/5 dark:ring-white/10"
                style={{ backgroundColor: colors.secondary }}
              />
              <div
                className="h-10 flex-1 rounded-lg shadow-md ring-1 ring-black/5 dark:ring-white/10"
                style={{ backgroundColor: colors.tertiary }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Preview - Shared Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Tablet Preview */}
        <div className="col-span-2 space-y-2">
          <p className="text-xs font-medium text-text-muted">{t("settings.tabletView")}</p>
          <div className="rounded-xl border border-card-border bg-card overflow-hidden shadow-sm transform scale-85 origin-top">
            <div className="h-24 relative">
              {form.bannerImageUrl ? (
                <Image
                  src={form.bannerImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="3840px"
                />
              ) : (
                <div className="absolute inset-0 overflow-hidden">
                  {/* Base gradient */}
                  <div
                    className="absolute inset-0 transition-all duration-700"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a1a 100%)'
                        : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0f2fe 75%, #f0f9ff 100%)',
                    }}
                  />

                  {/* Blob shapes - scaled for banner preview */}
                  <div className="absolute top-0 left-0 w-[250px] h-[250px]" style={{ background: isDark ? 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(15px)', opacity: isDark ? 0.6 : 0.7, animation: 'lava-morph-1 40s ease-in-out infinite' }} />
                  <div className="absolute top-1/4 right-0 w-[220px] h-[220px]" style={{ background: isDark ? 'linear-gradient(225deg, #3730a3 0%, #4338ca 50%, #1e3a5f 100%)' : 'linear-gradient(225deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', filter: 'blur(12px)', opacity: isDark ? 0.5 : 0.65, animation: 'lava-morph-2 50s ease-in-out infinite' }} />
                  <div className="absolute bottom-0 left-1/4 w-[190px] h-[190px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)' : 'linear-gradient(45deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)', borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%', filter: 'blur(18px)', opacity: isDark ? 0.55 : 0.75, animation: 'lava-morph-3 44s ease-in-out infinite' }} />
                  <div className="absolute top-1/2 right-1/4 w-[170px] h-[170px]" style={{ background: isDark ? 'linear-gradient(315deg, #4338ca 0%, #3730a3 50%, #312e81 100%)' : 'linear-gradient(315deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', filter: 'blur(14px)', opacity: isDark ? 0.45 : 0.6, animation: 'lava-morph-4 36s ease-in-out infinite' }} />
                  <div className="absolute bottom-1/4 left-0 w-[150px] h-[150px]" style={{ background: isDark ? 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', borderRadius: '50% 50% 40% 60% / 50% 40% 60% 50%', filter: 'blur(11px)', opacity: isDark ? 0.4 : 0.6, animation: 'lava-morph-5 48s ease-in-out infinite' }} />
                  <div className="absolute top-1/4 right-1/5 w-[130px] h-[130px]" style={{ background: isDark ? 'linear-gradient(180deg, #4c1d95 0%, #5b21b6 50%, #312e81 100%)' : 'linear-gradient(180deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)', borderRadius: '60% 40% 70% 30% / 40% 60% 30% 70%', filter: 'blur(10px)', opacity: isDark ? 0.35 : 0.65, animation: 'lava-morph-6 56s ease-in-out infinite' }} />
                  <div className="absolute bottom-0 left-1/3 w-[110px] h-[110px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e3a8a 0%, #3730a3 100%)' : 'linear-gradient(45deg, #2563eb 0%, #3b82f6 100%)', borderRadius: '40% 60% 50% 50% / 50% 40% 50% 60%', filter: 'blur(9px)', opacity: isDark ? 0.3 : 0.55, animation: 'lava-morph-7 60s ease-in-out infinite' }} />

                  {/* Overlay */}
                  <div className="absolute inset-0 transition-all duration-700" style={{ background: isDark ? 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,26,0.4) 100%)' : 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)' }} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
            </div>
            <div className="p-4 pt-0">
              <div className="flex items-center gap-3 -mt-8 mb-3">
                <div
                  className="w-14 h-14 rounded-full border-[3px] border-card flex items-center justify-center overflow-hidden relative shadow-xl"
                  style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', boxShadow: `0 6px 24px -6px ${colors.primary}40` }}
                >
                  {form.logoImageUrl ? (
                    <Image src={form.logoImageUrl} alt="" fill className="object-cover" sizes="512px" />
                  ) : selectedCompanyId ? (
                    <Building2 className="w-7 h-7" style={{ color: colors.primary }} />
                  ) : (
                    <UserCircle className="w-7 h-7" style={{ color: colors.primary }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 -mt-0.5">
                </div>
              </div>
              <div className="flex gap-2">
                <div
                  className="h-8 flex-1 rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  style={{ backgroundColor: colors.primary }}
                />
                <div
                  className="h-8 flex-1 rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  style={{ backgroundColor: colors.secondary }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Preview */}
        <div className="col-span-1 space-y-2">
          <p className="text-xs font-medium text-text-muted">{t("settings.mobileView")}</p>
          <div className="rounded-xl border border-card-border bg-card overflow-hidden shadow-sm transform scale-65 origin-top">
            <div className="h-16 relative">
              {form.bannerImageUrl ? (
                <Image
                  src={form.bannerImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="3840px"
                />
              ) : (
                <div className="absolute inset-0 overflow-hidden">
                  {/* Base gradient */}
                  <div
                    className="absolute inset-0 transition-all duration-700"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a1a 100%)'
                        : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0f2fe 75%, #f0f9ff 100%)',
                    }}
                  />

                  {/* Blob shapes - scaled for banner preview */}
                  <div className="absolute top-0 left-0 w-[180px] h-[180px]" style={{ background: isDark ? 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(15px)', opacity: isDark ? 0.6 : 0.7, animation: 'lava-morph-1 25s ease-in-out infinite' }} />
                  <div className="absolute top-1/4 right-0 w-[160px] h-[160px]" style={{ background: isDark ? 'linear-gradient(225deg, #3730a3 0%, #4338ca 50%, #1e3a5f 100%)' : 'linear-gradient(225deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', filter: 'blur(12px)', opacity: isDark ? 0.5 : 0.65, animation: 'lava-morph-2 30s ease-in-out infinite' }} />
                  <div className="absolute bottom-0 left-1/4 w-[140px] h-[140px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)' : 'linear-gradient(45deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)', borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%', filter: 'blur(18px)', opacity: isDark ? 0.55 : 0.75, animation: 'lava-morph-3 28s ease-in-out infinite' }} />
                  <div className="absolute top-1/2 right-1/4 w-[130px] h-[130px]" style={{ background: isDark ? 'linear-gradient(315deg, #4338ca 0%, #3730a3 50%, #312e81 100%)' : 'linear-gradient(315deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', filter: 'blur(14px)', opacity: isDark ? 0.45 : 0.6, animation: 'lava-morph-4 24s ease-in-out infinite' }} />
                  <div className="absolute bottom-1/4 left-0 w-[110px] h-[110px]" style={{ background: isDark ? 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', borderRadius: '50% 50% 40% 60% / 50% 40% 60% 50%', filter: 'blur(11px)', opacity: isDark ? 0.4 : 0.6, animation: 'lava-morph-5 32s ease-in-out infinite' }} />
                  <div className="absolute top-1/4 right-1/5 w-[90px] h-[90px]" style={{ background: isDark ? 'linear-gradient(180deg, #4c1d95 0%, #5b21b6 50%, #312e81 100%)' : 'linear-gradient(180deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)', borderRadius: '60% 40% 70% 30% / 40% 60% 30% 70%', filter: 'blur(10px)', opacity: isDark ? 0.35 : 0.65, animation: 'lava-morph-6 36s ease-in-out infinite' }} />
                  <div className="absolute bottom-0 left-1/3 w-[80px] h-[80px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e3a8a 0%, #3730a3 100%)' : 'linear-gradient(45deg, #2563eb 0%, #3b82f6 100%)', borderRadius: '40% 60% 50% 50% / 50% 40% 50% 60%', filter: 'blur(9px)', opacity: isDark ? 0.3 : 0.55, animation: 'lava-morph-7 40s ease-in-out infinite' }} />

                  {/* Overlay */}
                  <div className="absolute inset-0 transition-all duration-700" style={{ background: isDark ? 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,26,0.4) 100%)' : 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)' }} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
            </div>
            <div className="p-3 pt-0">
              <div className="flex items-center gap-2 -mt-6 mb-2">
                <div
                  className="w-10 h-10 rounded-full border-[3px] border-card flex items-center justify-center overflow-hidden relative shadow-xl"
                  style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', boxShadow: `0 8px 32px -8px ${colors.primary}40` }}
                >
                  {form.logoImageUrl ? (
                    <Image src={form.logoImageUrl} alt="" fill className="object-cover" sizes="512px" />
                  ) : selectedCompanyId ? (
                    <Building2 className="w-5 h-5" style={{ color: colors.primary }} />
                  ) : (
                    <UserCircle className="w-5 h-5" style={{ color: colors.primary }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 -mt-0.5">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function SettingsPage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const setCompanyBranding = useDashboardStore((s) => s.setCompanyBranding);
  const selectedCompanyId = useDashboardStore((s) => s.selectedCompanyId);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const setBrandingInCache = useDashboardStore((s) => s.setBrandingInCache);
  const currentBranding = useDashboardStore((s) => s.companyBranding);

  const defaultForm: BrandingConfig = {
    bannerImageUrl: "",
    logoImageUrl: "",
    primaryColor: THEME_DEFAULT_PRIMARY_LIGHT,
    primaryColorDark: THEME_DEFAULT_PRIMARY_DARK,
    secondaryColor: THEME_DEFAULT_SECONDARY_LIGHT,
    secondaryColorDark: THEME_DEFAULT_SECONDARY_DARK,
    tertiaryColor: THEME_DEFAULT_TERTIARY_LIGHT,
    tertiaryColorDark: THEME_DEFAULT_TERTIARY_DARK,
  };

  const [form, setForm] = useState<BrandingConfig>(defaultForm);
  const [initialForm, setInitialForm] = useState<BrandingConfig>(defaultForm);

  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"visual" | "colors" | "preview">("visual");

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm]
  );

  const handleCopyHex = (id: string) => {
    setCopiedId(id);
  };

  useEffect(() => {
    if (!copiedId) return;
    const timer = setTimeout(() => setCopiedId(null), 1500);
    return () => clearTimeout(timer);
  }, [copiedId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiClient.get<{ brandingConfig?: BrandingConfig | null }>("/companies/me/branding");
        if (!cancelled && data?.brandingConfig && typeof data.brandingConfig === "object") {
          const bc = data.brandingConfig as BrandingConfig;
          const loaded = {
            bannerImageUrl: bc.bannerImageUrl ?? "",
            logoImageUrl: bc.logoImageUrl ?? "",
            primaryColor: bc.primaryColor ?? THEME_DEFAULT_PRIMARY_LIGHT,
            primaryColorDark: bc.primaryColorDark ?? THEME_DEFAULT_PRIMARY_DARK,
            secondaryColor: bc.secondaryColor ?? THEME_DEFAULT_SECONDARY_LIGHT,
            secondaryColorDark: bc.secondaryColorDark ?? THEME_DEFAULT_SECONDARY_DARK,
            tertiaryColor: bc.tertiaryColor ?? THEME_DEFAULT_TERTIARY_LIGHT,
            tertiaryColorDark: bc.tertiaryColorDark ?? THEME_DEFAULT_TERTIARY_DARK,
          };
          setForm(loaded);
          setInitialForm(loaded);
        }
      } catch {
        if (!cancelled) setLoadError(t("settings.saveError"));
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId]);

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

      const branding = {
        bannerImageUrl: form.bannerImageUrl?.trim() || null,
        logoImageUrl: form.logoImageUrl?.trim() || null,
        primaryColor: primaryColor || null,
        primaryColorDark: primaryColorDark || null,
        secondaryColor: secondaryColor || null,
        secondaryColorDark: secondaryColorDark || null,
        tertiaryColor: tertiaryColor || null,
        tertiaryColorDark: tertiaryColorDark || null,
        businessActivity: currentBranding?.businessActivity ?? null,
      };

      setCompanyBranding(branding);
      if (selectedCompanyId) setBrandingInCache(selectedCompanyId, branding);
      setInitialForm(form);
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
      // Only revert fields of the active tab
      const serverPayload: Partial<BrandingConfig> = {};
      
      if (activeTab === "visual") {
        serverPayload.bannerImageUrl = null;
        serverPayload.logoImageUrl = null;
      } else if (activeTab === "colors") {
        serverPayload.primaryColor = THEME_DEFAULT_PRIMARY_LIGHT;
        serverPayload.primaryColorDark = THEME_DEFAULT_PRIMARY_DARK;
        serverPayload.secondaryColor = THEME_DEFAULT_SECONDARY_LIGHT;
        serverPayload.secondaryColorDark = THEME_DEFAULT_SECONDARY_DARK;
        serverPayload.tertiaryColor = THEME_DEFAULT_TERTIARY_LIGHT;
        serverPayload.tertiaryColorDark = THEME_DEFAULT_TERTIARY_DARK;
      }

      await apiClient.patch("/companies/me", {
        brandingConfig: serverPayload,
      });

      // Merge with current branding to preserve other fields
      const updatedBranding = {
        ...currentBranding,
        ...serverPayload,
        businessActivity: currentBranding?.businessActivity ?? null,
      };

      setCompanyBranding(updatedBranding);
      if (selectedCompanyId) setBrandingInCache(selectedCompanyId, updatedBranding);

      // Form state uses empty strings for image URLs (UI inputs need strings)
      setForm((p) => ({
        ...p,
        ...(activeTab === "visual" && {
          bannerImageUrl: "",
          logoImageUrl: "",
        }),
        ...(activeTab === "colors" && {
          primaryColor: THEME_DEFAULT_PRIMARY_LIGHT,
          primaryColorDark: THEME_DEFAULT_PRIMARY_DARK,
          secondaryColor: THEME_DEFAULT_SECONDARY_LIGHT,
          secondaryColorDark: THEME_DEFAULT_SECONDARY_DARK,
          tertiaryColor: THEME_DEFAULT_TERTIARY_LIGHT,
          tertiaryColorDark: THEME_DEFAULT_TERTIARY_DARK,
        }),
      }));
      setInitialForm((p) => ({
        ...p,
        ...(activeTab === "visual" && {
          bannerImageUrl: "",
          logoImageUrl: "",
        }),
        ...(activeTab === "colors" && {
          primaryColor: THEME_DEFAULT_PRIMARY_LIGHT,
          primaryColorDark: THEME_DEFAULT_PRIMARY_DARK,
          secondaryColor: THEME_DEFAULT_SECONDARY_LIGHT,
          secondaryColorDark: THEME_DEFAULT_SECONDARY_DARK,
          tertiaryColor: THEME_DEFAULT_TERTIARY_LIGHT,
          tertiaryColorDark: THEME_DEFAULT_TERTIARY_DARK,
        }),
      }));
      showSuccess(t("settings.saveSuccess"));
    } catch {
      showError(t("settings.saveError"));
    } finally {
      setReverting(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="flex flex-col flex-1 min-h-0 pt-4 pb-6 px-4 md:px-8 lg:px-10 w-full">
        {/* Skeleton Tab Navigation */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-input-bg border border-card-border mb-6 w-64 h-10 animate-pulse" />

        {/* Skeleton Settings Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="space-y-6 xl:col-span-12">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 w-10 h-10 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-8 pl-1">
                    <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                    <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col flex-1 min-h-0 pt-4 pb-6 px-4 md:px-8 lg:px-10 w-full"
    >
      {loadError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-red-500/20 bg-gradient-to-r from-red-500/10 to-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400 shrink-0 mb-6"
        >
          {loadError}
        </motion.div>
      )}

      {/* Tab Navigation - Toggle Style */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-input-bg border border-card-border mb-6 w-fit">
        <button
          onClick={() => setActiveTab("visual")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === "visual"
              ? "bg-white dark:bg-slate-700 text-company-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          {t("settings.visualIdentity")}
        </button>
        <button
          onClick={() => setActiveTab("colors")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === "colors"
              ? "bg-white dark:bg-slate-700 text-company-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          <Palette className="w-4 h-4" />
          {t("settings.colorPalette")}
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === "preview"
              ? "bg-white dark:bg-slate-700 text-company-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          <Eye className="w-4 h-4" />
          {t("settings.livePreview")}
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column - Settings (full width when not preview) */}
          <div className="space-y-6 xl:col-span-12">
            {activeTab === "visual" ? (
              <div className="space-y-8">
                {/* Visual Identity Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-company-primary/10">
                      <ImageIcon className="w-5 h-5 text-company-primary" />
                    </div>
                    <div>
                      <h2 className="text-base premium-section-title">
                        {t("settings.companyTheme")}
                      </h2>
                      <p className="text-sm premium-subtitle">{t("settings.companyThemeDescription")}</p>
                    </div>
                  </div>
                  <div className="space-y-8 pl-1">
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
                      recommendedSize="1200 × 240 px"
                      layout="row"
                      t={t}
                    />
                  </div>
                </div>
              </div>
              ) : activeTab === "colors" ? (
                <div className="space-y-8">
                  {/* Colors Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-company-primary/10">
                        <Palette className="w-5 h-5 text-company-primary" />
                      </div>
                      <div>
                        <h2 className="text-base premium-section-title">{t("settings.sectionColors")}</h2>
                        <p className="text-sm premium-subtitle">{t("settings.sectionColorsDesc")}</p>
                      </div>
                    </div>
                    <div className="space-y-8 pl-1">
                      {/* Primary Color */}
                      <div className="space-y-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-lg shadow-md ring-2 ring-white dark:ring-slate-700"
                            style={{ backgroundColor: parseHexColor(form.primaryColor || "", THEME_DEFAULT_PRIMARY_LIGHT) }}
                          />
                          <div>
                            <label className="text-sm font-semibold text-text-primary">
                              {t("settings.primaryColor")}
                            </label>
                            <p className="text-xs premium-subtitle">{t("settings.primaryColorDescription")}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-3">
                            <span className="text-xs font-semibold text-text-secondary flex items-center gap-2">
                              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 shadow-sm flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              </div>
                              {t("settings.forLightMode")}
                            </span>
                            <ColorInput
                              value={form.primaryColor ?? ""}
                              onChange={(v) => setForm((p) => ({ ...p, primaryColor: v }))}
                              label={`${t("settings.primaryColor")} ${t("settings.forLightMode")}`}
                              placeholder={THEME_DEFAULT_PRIMARY_LIGHT}
                              id="primary-light"
                              copiedId={copiedId}
                              onCopy={handleCopyHex}
                              copyLabel={t("settings.copyHex")}
                            />
                          </div>
                          <div className="space-y-3">
                            <span className="text-xs font-semibold text-text-secondary flex items-center gap-2">
                              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-slate-700 to-slate-800 shadow-sm flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              </div>
                              {t("settings.forDarkMode")}
                            </span>
                            <ColorInput
                              value={form.primaryColorDark ?? ""}
                              onChange={(v) => setForm((p) => ({ ...p, primaryColorDark: v }))}
                              label={`${t("settings.primaryColor")} ${t("settings.forDarkMode")}`}
                              placeholder={THEME_DEFAULT_PRIMARY_DARK}
                              id="primary-dark"
                              copiedId={copiedId}
                              onCopy={handleCopyHex}
                              copyLabel={t("settings.copyHex")}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-card-border" />

                      {/* Secondary Color */}
                      <div className="space-y-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-lg shadow-md ring-2 ring-white dark:ring-slate-700"
                            style={{ backgroundColor: parseHexColor(form.secondaryColor || "", THEME_DEFAULT_SECONDARY_LIGHT) }}
                          />
                          <div>
                            <label className="text-sm font-semibold text-text-primary">
                              {t("settings.secondaryColor")}
                            </label>
                            <p className="text-xs premium-subtitle">{t("settings.secondaryColorDescription")}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-3">
                            <span className="text-xs font-semibold text-text-secondary flex items-center gap-2">
                              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 shadow-sm flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              </div>
                              {t("settings.forLightMode")}
                            </span>
                            <ColorInput
                              value={form.secondaryColor ?? ""}
                              onChange={(v) => setForm((p) => ({ ...p, secondaryColor: v }))}
                              label={`${t("settings.secondaryColor")} ${t("settings.forLightMode")}`}
                              placeholder={THEME_DEFAULT_SECONDARY_LIGHT}
                              id="secondary-light"
                              copiedId={copiedId}
                              onCopy={handleCopyHex}
                              copyLabel={t("settings.copyHex")}
                            />
                          </div>
                          <div className="space-y-3">
                            <span className="text-xs font-semibold text-text-secondary flex items-center gap-2">
                              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-slate-700 to-slate-800 shadow-sm flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              </div>
                              {t("settings.forDarkMode")}
                            </span>
                            <ColorInput
                              value={form.secondaryColorDark ?? ""}
                              onChange={(v) => setForm((p) => ({ ...p, secondaryColorDark: v }))}
                              label={`${t("settings.secondaryColor")} ${t("settings.forDarkMode")}`}
                              placeholder={THEME_DEFAULT_SECONDARY_DARK}
                              id="secondary-dark"
                              copiedId={copiedId}
                              onCopy={handleCopyHex}
                              copyLabel={t("settings.copyHex")}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-card-border" />

                      {/* Tertiary Color */}
                      <div className="space-y-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-lg shadow-md ring-2 ring-white dark:ring-slate-700"
                            style={{ backgroundColor: parseHexColor(form.tertiaryColor || "", THEME_DEFAULT_TERTIARY_LIGHT) }}
                          />
                          <div>
                            <label className="text-sm font-semibold text-text-primary">
                              {t("settings.tertiaryColor")}
                            </label>
                            <p className="text-xs premium-subtitle">{t("settings.tertiaryColorDescription")}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-3">
                            <span className="text-xs font-semibold text-text-secondary flex items-center gap-2">
                              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 shadow-sm flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              </div>
                              {t("settings.forLightMode")}
                            </span>
                            <ColorInput
                              value={form.tertiaryColor ?? ""}
                              onChange={(v) => setForm((p) => ({ ...p, tertiaryColor: v }))}
                              label={`${t("settings.tertiaryColor")} ${t("settings.forLightMode")}`}
                              placeholder={THEME_DEFAULT_TERTIARY_LIGHT}
                              id="tertiary-light"
                              copiedId={copiedId}
                              onCopy={handleCopyHex}
                              copyLabel={t("settings.copyHex")}
                            />
                          </div>
                          <div className="space-y-3">
                            <span className="text-xs font-semibold text-text-secondary flex items-center gap-2">
                              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-slate-700 to-slate-800 shadow-sm flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              </div>
                              {t("settings.forDarkMode")}
                            </span>
                            <ColorInput
                              value={form.tertiaryColorDark ?? ""}
                              onChange={(v) => setForm((p) => ({ ...p, tertiaryColorDark: v }))}
                              label={`${t("settings.tertiaryColor")} ${t("settings.forDarkMode")}`}
                              placeholder={THEME_DEFAULT_TERTIARY_DARK}
                              id="tertiary-dark"
                              copiedId={copiedId}
                              onCopy={handleCopyHex}
                              copyLabel={t("settings.copyHex")}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === "preview" ? (
                <div className="space-y-8">
                  {/* Live Preview Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-company-primary/10">
                        <Eye className="w-5 h-5 text-company-primary" />
                      </div>
                      <div>
                        <h2 className="text-base premium-section-title">{t("settings.livePreview")}</h2>
                        <p className="text-sm premium-subtitle">{t("settings.previewLabel")}</p>
                      </div>
                    </div>
                    <div className="space-y-8 pl-1">
                      {/* Device Previews */}
                      <div>
                        <DevicePreviews form={form} t={t} companyName={selectedCompanyName} selectedCompanyId={selectedCompanyId} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-card-border">
        <button
          type="button"
          onClick={handleRevertToDefault}
          disabled={reverting || submitting}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-lg border border-card-border text-sm font-medium text-text-secondary hover:text-red-500 hover:border-red-200 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:hover:text-text-secondary disabled:hover:border-card-border disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
        >
          {reverting ? (
            <LoadingSpinner size="sm" />
          ) : (
            <RotateCcw className="w-4 h-4 transition-transform duration-500 group-hover:-rotate-180" />
          )}
          {t("settings.revertToDefault")}
        </button>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl border border-card-border text-sm font-medium text-text-secondary hover:bg-card hover:text-text-primary transition-all hover:border-company-secondary/30"
          >
            {t("common.cancel")}
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isDirty || submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {submitting ? <><LoadingSpinner size="sm" />{t("common.saving")}</> : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
