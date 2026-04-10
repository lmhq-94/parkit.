"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  Clock,
  Shield,
  Sun,
  Moon,
  Globe,
  Camera,
  Settings2,
  SlidersHorizontal,
  RotateCcw,
} from "@/lib/premiumIcons";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { useAuthStore, useDashboardStore, useLocaleStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageLoader } from "@/components/PageLoader";
import { ImageCropField } from "@/components/ImageCropField";
import { SelectField } from "@/components/SelectField";
import { useToast } from "@/lib/toastStore";
import { TIMEZONES } from "@/lib/companyOptions";
import {
  formatPhoneWithCountryCode,
  COUNTRY_DIAL_CODES,
  getDeviceCountryCode,
} from "@/lib/inputMasks";
import {
  required,
  email as validateEmail,
  phone as validatePhone,
} from "@/lib/validation";
import { isSuperAdmin } from "@/lib/auth";

type ThemeValue = "light" | "dark";
type LocaleValue = "es" | "en";

/** Available languages; add here and in i18n (profile.languageX) for additional languages. */
const LOCALE_OPTIONS: { value: LocaleValue; labelKey: string }[] = [
  { value: "es", labelKey: "profile.languageEs" },
  { value: "en", labelKey: "profile.languageEn" },
];

const IL =
  "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

const defaultForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  timezone: "",
  avatarUrl: "",
  theme: "light" as ThemeValue,
  locale: "es" as LocaleValue,
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const selectedCompanyId = useDashboardStore((s) => s.selectedCompanyId);
  const { setTheme } = useTheme();
  const setLocale = useLocaleStore((s) => s.setLocale);
  const [form, setForm] = useState(defaultForm);
  const [initialForm, setInitialForm] = useState(defaultForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof defaultForm, string>>
  >({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasLocalEditsRef = useRef(false);
  const [phoneCountry, setPhoneCountry] = useState<string>("CR");
  const [activeTab, setActiveTab] = useState<"info" | "avatar" | "preferences" | "superAdmin">("info");
  
  // Super admin invitation state (like invite modal)
  const [superAdminEmails, setSuperAdminEmails] = useState<string[]>([]);
  const [superAdminEmailInput, setSuperAdminEmailInput] = useState("");
  const [sendingSuperAdminInvites, setSendingSuperAdminInvites] = useState(false);
  
  const addSuperAdminEmail = () => {
    const trimmed = superAdminEmailInput.trim().toLowerCase();
    if (trimmed && trimmed.includes("@") && !superAdminEmails.includes(trimmed)) {
      setSuperAdminEmails((prev) => [...prev, trimmed]);
      setSuperAdminEmailInput("");
    }
  };
  
  const removeSuperAdminEmail = (email: string) => {
    setSuperAdminEmails((prev) => prev.filter((e) => e !== email));
  };
  
  const handleSendSuperAdminInvites = async () => {
    if (superAdminEmails.length === 0) {
      showError(t("users.noEmails"));
      return;
    }
    
    setSendingSuperAdminInvites(true);
    try {
      // TODO: Replace with proper invitation endpoint when backend supports it
      // For now, create super admins directly one by one
      for (const email of superAdminEmails) {
        await apiClient.post("/users/super-admin", {
          email: email.trim(),
          firstName: "",
          lastName: "",
        });
      }
      showSuccess(t("users.invitationsSentCount", { count: superAdminEmails.length }));
      setSuperAdminEmails([]);
      setSuperAdminEmailInput("");
    } catch (err) {
      const msg = getTranslatedApiErrorMessage(err, t);
      showError(msg);
    } finally {
      setSendingSuperAdminInvites(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const companyPromise = (async () => {
          const superAdmin = isSuperAdmin(user);
          if (superAdmin && selectedCompanyId) {
            return apiClient.get<{ countryCode?: string | null }>(`/companies/${selectedCompanyId}`);
          }
          if (!superAdmin) {
            return apiClient.get<{ countryCode?: string | null }>("/companies/me");
          }
          return null;
        })();
        const [data, company] = await Promise.all([
          apiClient.get<Record<string, unknown>>("/users/me"),
          companyPromise,
        ]);
        const countryCode =
          (company && typeof company === "object" && "countryCode" in company && company.countryCode) ||
          getDeviceCountryCode() ||
          "CR";
        if (!cancelled) setPhoneCountry(countryCode);
        if (!cancelled && data) {
          if (hasLocalEditsRef.current) return;
          const userPrefs = (data.appPreferences as Record<string, string> | undefined) ?? {};
          const loaded = {
            firstName: String(data.firstName ?? ""),
            lastName: String(data.lastName ?? ""),
            email: String(data.email ?? ""),
            phone: formatPhoneWithCountryCode(String(data.phone ?? ""), countryCode),
            timezone: String(data.timezone ?? ""),
            avatarUrl: String(data.avatarUrl ?? ""),
            theme: (userPrefs.theme === "dark" ? "dark" : "light") as ThemeValue,
            locale: (userPrefs.locale === "en" ? "en" : "es") as LocaleValue,
          };
          setForm(loaded);
          setInitialForm(loaded);
          // Apply loaded preferences immediately
          setTheme(loaded.theme);
          setLocale(loaded.locale);
        }
      } catch {
        if (!cancelled) {
          setLoadError(t("common.loadError"));
          showError(t("common.loadError"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCompanyId, showError, t, user, setTheme, setLocale]);

  const set =
    (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => {
        hasLocalEditsRef.current = true;
        return { ...p, [k]: e.target.value };
      });
  const setAndClearError =
    (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((p) => {
        hasLocalEditsRef.current = true;
        return { ...p, [k]: e.target.value };
      });
      setErrors((prev) => ({ ...prev, [k]: undefined }));
    };

  const validate = (): boolean => {
    const next: Partial<Record<keyof typeof defaultForm, string>> = {};
    const e1 = required(t, form.firstName);
    if (e1) next.firstName = e1;
    const e2 = required(t, form.lastName);
    if (e2) next.lastName = e2;
    const e3 = required(t, form.email) ?? validateEmail(t, form.email);
    if (e3) next.email = e3;
    if (form.phone.trim()) {
      const ep = validatePhone(t, form.phone);
      if (ep) next.phone = ep;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setLoadError(null);
    try {
      const response = await apiClient.patch<Record<string, unknown>>(
        "/users/me",
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone:
            form.phone.replace(/\D/g, "").length > 0
              ? form.phone.replace(/\D/g, "")
              : undefined,
          timezone: form.timezone.trim() || undefined,
          avatarUrl: form.avatarUrl?.trim() || null,
          appPreferences: {
            theme: form.theme,
            locale: form.locale,
          },
        },
      );
      // Apply theme and locale immediately after save
      setTheme(form.theme);
      setLocale(form.locale);
      if (response && user) {
        setUser({
          ...user,
          firstName: String(response.firstName ?? user.firstName),
          lastName: String(response.lastName ?? user.lastName),
          email: String(response.email ?? user.email),
          phone: response.phone != null ? String(response.phone) : undefined,
          timezone:
            response.timezone != null ? String(response.timezone) : undefined,
          avatarUrl:
            response.avatarUrl != null ? String(response.avatarUrl) : undefined,
          avatar:
            response.avatarUrl != null ? String(response.avatarUrl) : undefined,
        });
      }
      const userPrefs = (response?.appPreferences as Record<string, string> | undefined) ?? {};
      const nextForm = {
        ...form,
        firstName: String(response?.firstName ?? form.firstName),
        lastName: String(response?.lastName ?? form.lastName),
        email: String(response?.email ?? form.email),
        phone:
          response?.phone != null
            ? formatPhoneWithCountryCode(String(response.phone), phoneCountry)
            : form.phone,
        timezone:
          response?.timezone != null ? String(response.timezone) : form.timezone,
        avatarUrl:
          response?.avatarUrl != null ? String(response.avatarUrl) : form.avatarUrl,
        theme: (userPrefs.theme === "dark" ? "dark" : form.theme) as ThemeValue,
        locale: (userPrefs.locale === "en" ? "en" : form.locale) as LocaleValue,
      };
      setForm(nextForm);
      setInitialForm(nextForm);
      hasLocalEditsRef.current = false;
      showSuccess(t("profile.saveSuccess"));
    } catch (err) {
      showError(getTranslatedApiErrorMessage(err, t) || t("profile.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm]
  );
  const isValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    Object.keys(errors).length === 0;

  const handleThemeChange = (value: ThemeValue) => {
    setForm((p) => ({ ...p, theme: value }));
    hasLocalEditsRef.current = true;
  };

  const handleLocaleChange = (value: LocaleValue) => {
    setForm((p) => ({ ...p, locale: value }));
    hasLocalEditsRef.current = true;
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
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400 shrink-0 mb-4">
          {loadError}
        </div>
      )}

      {/* Tab Navigation - Toggle Style */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-input-bg border border-card-border mb-6 w-fit">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === "info"
              ? "bg-white dark:bg-slate-700 text-company-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          <User className="w-4 h-4" />
          {t("profile.tabInfo")}
        </button>
        <button
          onClick={() => setActiveTab("avatar")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === "avatar"
              ? "bg-white dark:bg-slate-700 text-company-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          <Camera className="w-4 h-4" />
          {t("profile.tabAvatar")}
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === "preferences"
              ? "bg-white dark:bg-slate-700 text-company-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t("profile.tabPreferences")}
        </button>
        {isSuperAdmin(user) && (
          <button
            onClick={() => setActiveTab("superAdmin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "superAdmin"
                ? "bg-white dark:bg-slate-700 text-company-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <Shield className="w-4 h-4" />
            {t("superAdmins.newSuperAdmin")}
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-4">
        <div>
          {activeTab === "info" ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-company-primary/10">
                  <Settings2 className="w-5 h-5 text-company-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base premium-section-title flex items-center gap-2">
                    {t("profile.sectionInfo")}
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">{t("common.requiredBadge")}</span>
                  </h2>
                  <p className="text-sm premium-subtitle">{t("profile.sectionInfoDesc")}</p>
                </div>
              </div>
              <div className="pl-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="min-w-0">
                    <label className={LABEL}>
                      {t("users.firstName")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                      <input
                        value={form.firstName}
                        onChange={setAndClearError("firstName")}
                        placeholder={t("common.placeholderName")}
                        className={IL}
                        aria-invalid={!!errors.firstName}
                      />
                    </div>
                    <div className="min-h-[1.25rem] mt-1">
                      {errors.firstName && (
                        <p className="text-sm text-red-500" role="alert">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className={LABEL}>
                      {t("users.lastName")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                      <input
                        value={form.lastName}
                        onChange={setAndClearError("lastName")}
                        placeholder={t("common.placeholderLastName")}
                        className={IL}
                        aria-invalid={!!errors.lastName}
                      />
                    </div>
                    <div className="min-h-[1.25rem] mt-1">
                      {errors.lastName && (
                        <p className="text-sm text-red-500" role="alert">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <label className={LABEL}>
                      {t("users.email")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={setAndClearError("email")}
                        placeholder={t("common.placeholderEmail")}
                        className={IL}
                        aria-invalid={!!errors.email}
                      />
                    </div>
                    <div className="min-h-[1.25rem] mt-1">
                      {errors.email && (
                        <p className="text-sm text-red-500" role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className={LABEL}>{t("users.phone")}</label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, phone: formatPhoneWithCountryCode(e.target.value, phoneCountry) }));
                          setErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        placeholder={`+${COUNTRY_DIAL_CODES[phoneCountry] || "1"}`}
                        className={IL}
                        aria-invalid={!!errors.phone}
                      />
                    </div>
                    <div className="min-h-[1.25rem] mt-1">
                      {errors.phone && (
                        <p className="text-sm text-red-500" role="alert">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className={LABEL}>{t("users.timezone")}</label>
                    <SelectField
                      value={form.timezone}
                      onChange={set("timezone")}
                      icon={Clock}
                    >
                      <option value="">{t("common.selectPlaceholder")}</option>
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "avatar" ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-company-primary/10">
                  <Camera className="w-5 h-5 text-company-primary" />
                </div>
                <div>
                  <h2 className="text-base premium-section-title flex items-center gap-2">
                    {t("profile.sectionAvatar")}
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-text-muted/10 text-text-muted">{t("common.optionalBadge")}</span>
                  </h2>
                  <p className="text-sm premium-subtitle">{t("profile.sectionAvatarDesc")}</p>
                </div>
              </div>
              <div className="pl-1">
                <ImageCropField
                  kind="logo"
                  value={form.avatarUrl}
                  onChange={(v) => {
                    hasLocalEditsRef.current = true;
                    setForm((p) => ({ ...p, avatarUrl: v }));
                  }}
                  onClear={() => {
                    hasLocalEditsRef.current = true;
                    setForm((p) => ({ ...p, avatarUrl: "" }));
                  }}
                  label={t("profile.avatarFieldLabel")}
                  description={t("profile.avatarImageDescription")}
                  recommendedSize="400 × 400 px"
                  layout="row"
                  t={t}
                />
              </div>
            </div>
          ) : activeTab === "preferences" ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-company-primary/10">
                  <SlidersHorizontal className="w-5 h-5 text-company-primary" />
                </div>
                <div>
                  <h2 className="text-base premium-section-title">
                    {t("profile.sectionPreferences")}
                  </h2>
                  <p className="text-sm premium-subtitle">{t("profile.sectionPreferencesDesc")}</p>
                </div>
              </div>
              <div className="pl-1">
                <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                  {/* Theme */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary mb-3">
                      {t("profile.themeLabel")}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleThemeChange("light")}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                          form.theme === "light"
                            ? "border-company-primary bg-company-primary-subtle ring-1 ring-company-primary/30 shadow-sm"
                            : "border-input-border bg-input-bg/50 hover:border-company-primary-muted hover:bg-input-bg"
                        }`}
                      >
                        <span
                          className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${form.theme === "light" ? "bg-company-primary/15 text-company-primary" : "bg-input-bg text-text-muted"}`}
                        >
                          <Sun className="w-5 h-5" />
                        </span>
                        <div className="w-full text-center space-y-0.5">
                          <p
                            className={`text-sm font-medium ${form.theme === "light" ? "text-company-primary" : "text-text-primary"}`}
                          >
                            {t("profile.themeLight")}
                          </p>
                          <p className="text-[11px] text-text-muted leading-tight">
                            {t("profile.themeLightDesc")}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleThemeChange("dark")}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                          form.theme === "dark"
                            ? "border-company-primary bg-company-primary-subtle ring-1 ring-company-primary/30 shadow-sm"
                            : "border-input-border bg-input-bg/50 hover:border-company-primary-muted hover:bg-input-bg"
                        }`}
                      >
                        <span
                          className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${form.theme === "dark" ? "bg-company-primary/15 text-company-primary" : "bg-input-bg text-text-muted"}`}
                        >
                          <Moon className="w-5 h-5" />
                        </span>
                        <div className="w-full text-center space-y-0.5">
                          <p
                            className={`text-sm font-medium ${form.theme === "dark" ? "text-company-primary" : "text-text-primary"}`}
                          >
                            {t("profile.themeDark")}
                          </p>
                          <p className="text-[11px] text-text-muted leading-tight">
                            {t("profile.themeDarkDesc")}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                  {/* Language */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary mb-3">
                      {t("profile.languageLabel")}
                    </p>
                    <SelectField
                      value={form.locale}
                      onChange={(e) =>
                        handleLocaleChange(e.target.value as LocaleValue)
                      }
                      icon={Globe}
                    >
                      {LOCALE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {t(opt.labelKey)}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "superAdmin" ? (
            <SuperAdminTab 
              t={t}
              emails={superAdminEmails}
              emailInput={superAdminEmailInput}
              setEmailInput={setSuperAdminEmailInput}
              onAddEmail={addSuperAdminEmail}
              onRemoveEmail={removeSuperAdminEmail}
            />
          ) : null}
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-card-border">
        {activeTab === "superAdmin" ? (
          <div />
        ) : (
          <button
            type="button"
            onClick={() => {
              setReverting(true);
              setForm(initialForm);
              hasLocalEditsRef.current = false;
              setTimeout(() => setReverting(false), 300);
            }}
            disabled={!isDirty || submitting || reverting}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-lg border border-card-border text-sm font-medium text-text-secondary hover:text-red-500 hover:border-red-200 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:hover:text-text-secondary disabled:hover:border-card-border disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
          >
            {reverting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RotateCcw className="w-4 h-4 transition-transform duration-500 group-hover:-rotate-180" />
            )}
            {t("profile.revertToDefault")}
          </button>
        )}
        <div className="flex items-center gap-3">
          {activeTab === "superAdmin" ? (
            <button
              type="button"
              onClick={handleSendSuperAdminInvites}
              disabled={sendingSuperAdminInvites || superAdminEmails.length === 0}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:opacity-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {sendingSuperAdminInvites ? (
                <>
                  <LoadingSpinner size="sm" />
                  {t("common.sending")}
                </>
              ) : (
                <>
                  {t("users.sendInvitation")}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="px-5 py-3 rounded-lg border border-card-border text-sm font-medium text-text-secondary hover:bg-input-bg transition-colors"
              >
                {t("common.cancel")}
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !isDirty || !isValid}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:opacity-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    {t("common.save")}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Component for Super Admin invitation tab (like InviteUserModal)
function SuperAdminTab({
  t,
  emails,
  emailInput,
  setEmailInput,
  onAddEmail,
  onRemoveEmail,
}: {
  t: (key: string) => string;
  emails: string[];
  emailInput: string;
  setEmailInput: (value: string) => void;
  onAddEmail: () => void;
  onRemoveEmail: (email: string) => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddEmail();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-company-primary/10">
          <Shield className="w-5 h-5 text-company-primary" />
        </div>
        <div>
          <h2 className="text-base premium-section-title flex items-center gap-2">
            {t("profile.sectionSuperAdmin")}
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
              {t("common.requiredBadge")}
            </span>
          </h2>
          <p className="text-sm premium-subtitle">{t("profile.sectionSuperAdminDesc")}</p>
        </div>
      </div>

      <div className="pl-1 space-y-4">
        {/* Email input with add button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("common.placeholderEmail")}
              className={IL}
            />
          </div>
          <button
            type="button"
            onClick={onAddEmail}
            disabled={!emailInput.trim().includes("@")}
            className="px-4 py-3 rounded-lg border border-card-border bg-input-bg text-text-primary hover:bg-input-bg/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("users.addAnother")}
          </button>
        </div>

        {/* Email chips */}
        {emails.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {emails.map((email) => (
              <div
                key={email}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-company-primary/10 text-company-primary text-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => onRemoveEmail(email)}
                  className="p-0.5 hover:bg-company-primary/20 rounded-full transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hint text */}
        <p className="text-xs text-text-muted">{t("superAdmins.invitationNote")}</p>
      </div>
    </div>
  );
}
