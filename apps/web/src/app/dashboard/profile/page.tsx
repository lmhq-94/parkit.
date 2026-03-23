"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowRight, User, Mail, Phone, Clock, UserPlus, Sun, Moon, Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { useAuthStore, useDashboardStore, useLocaleStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageLoader } from "@/components/PageLoader";
import { ImageCropField } from "@/components/ImageCropField";
import { SelectField } from "@/components/SelectField";
import { useToast } from "@/lib/toastStore";
import { TIMEZONES } from "@/lib/companyOptions";
import { formatPhoneInternational } from "@/lib/inputMasks";
import { required, email as validateEmail, phone as validatePhone } from "@/lib/validation";
import { isSuperAdmin } from "@/lib/auth";

type ThemeValue = "light" | "dark";
type LocaleValue = "es" | "en";

/** Available languages; add here and in i18n (profile.languageX) for additional languages. */
const LOCALE_OPTIONS: { value: LocaleValue; labelKey: string }[] = [
  { value: "es", labelKey: "profile.languageEs" },
  { value: "en", labelKey: "profile.languageEn" },
];

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

const defaultForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  timezone: "",
  avatarUrl: "",
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const selectedCompanyId = useDashboardStore((s) => s.selectedCompanyId);
  const { theme, setTheme } = useTheme();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const [form, setForm] = useState(defaultForm);
  const [initialForm, setInitialForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [prefsMounted, setPrefsMounted] = useState(false);
  useEffect(() => setPrefsMounted(true), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiClient.get<Record<string, unknown>>("/users/me");
        if (!cancelled && data) {
          const loaded = {
            firstName: String(data.firstName ?? ""),
            lastName: String(data.lastName ?? ""),
            email: String(data.email ?? ""),
            phone: formatPhoneInternational(String(data.phone ?? "")),
            timezone: String(data.timezone ?? ""),
            avatarUrl: String(data.avatarUrl ?? ""),
          };
          setForm(loaded);
          setInitialForm(loaded);
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
    return () => { cancelled = true; };
  }, [selectedCompanyId]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  const setAndClearError = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [k]: e.target.value }));
      setErrors((prev) => ({ ...prev, [k]: undefined }));
    };

  const validate = (): boolean => {
    const next: Partial<Record<keyof typeof defaultForm, string>> = {};
    const e1 = required(t, form.firstName); if (e1) next.firstName = e1;
    const e2 = required(t, form.lastName); if (e2) next.lastName = e2;
    const e3 = required(t, form.email) ?? validateEmail(t, form.email); if (e3) next.email = e3;
    if (form.phone.trim()) { const ep = validatePhone(t, form.phone); if (ep) next.phone = ep; }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setLoadError(null);
    try {
      const response = await apiClient.patch<Record<string, unknown>>("/users/me", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, "").length > 0 ? form.phone.replace(/\D/g, "") : undefined,
        timezone: form.timezone.trim() || undefined,
        avatarUrl: form.avatarUrl?.trim() || null,
      });
      if (response && user) {
        setUser({
          ...user,
          firstName: String(response.firstName ?? user.firstName),
          lastName: String(response.lastName ?? user.lastName),
          email: String(response.email ?? user.email),
          phone: response.phone != null ? String(response.phone) : undefined,
          timezone: response.timezone != null ? String(response.timezone) : undefined,
          avatarUrl: response.avatarUrl != null ? String(response.avatarUrl) : undefined,
          avatar: response.avatarUrl != null ? String(response.avatarUrl) : undefined,
        });
      }
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

  const currentTheme: ThemeValue = prefsMounted && theme === "dark" ? "dark" : "light";
  const currentLocale: LocaleValue = locale;

  const handleThemeChange = (value: ThemeValue) => {
    setTheme(value);
    apiClient
      .patch("/users/me", { appPreferences: { theme: value } })
      .then((res) => {
        if (user && res && typeof res === "object" && "appPreferences" in res) {
          setUser({ ...user, appPreferences: { ...user.appPreferences, theme: value } });
        }
      })
      .catch(() => {});
  };

  const handleLocaleChange = (value: LocaleValue) => {
    setLocale(value);
    apiClient
      .patch("/users/me", { appPreferences: { locale: value } })
      .then((res) => {
        if (user && res && typeof res === "object" && "appPreferences" in res) {
          setUser({ ...user, appPreferences: { ...user.appPreferences, locale: value } });
        }
      })
      .catch(() => {});
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

      {/* Same structure as Company Settings: internal scroll + grid + cards with gradient header */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8 items-start">
          {/* Section 1 - Profile photo (optional), same style as settings */}
          <div className="bg-card/60 rounded-2xl overflow-hidden min-w-0">
            <div className="px-6 py-4 bg-gradient-to-r from-violet-500/8 to-transparent">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-text-primary">{t("profile.sectionAvatar")}</p>
                <span className="text-[11px] font-medium text-text-muted">{t("common.optionalBadge")}</span>
              </div>
              <p className="text-xs text-text-muted break-words">{t("profile.sectionAvatarDesc")}</p>
            </div>
            <div className="px-6 pb-6 pt-2">
              <div className="flex flex-col gap-6">
                <ImageCropField
                  kind="logo"
                  value={form.avatarUrl}
                  onChange={(v) => setForm((p) => ({ ...p, avatarUrl: v }))}
                  onClear={() => setForm((p) => ({ ...p, avatarUrl: "" }))}
                  label={t("profile.avatarFieldLabel")}
                  description={t("profile.avatarImageDescription")}
                  recommendedSize="400 × 400 px"
                  layout="row"
                  t={t}
                />
              </div>
            </div>
          </div>

          {/* Section 2 - Personal info (required), same style as settings */}
          <div className="bg-card/60 rounded-2xl overflow-hidden min-w-0">
            <div className="px-6 py-4 bg-gradient-to-r from-violet-500/8 to-transparent flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-text-primary">{t("profile.sectionInfo")}</p>
                  <span className="text-[11px] font-medium text-red-500">{t("common.requiredBadge")}</span>
                </div>
                <p className="text-xs text-text-muted">{t("profile.sectionInfoDesc")}</p>
              </div>
              {isSuperAdmin(user) && (
                <Link
                  href="/dashboard/super-admins/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-company-secondary-muted text-sm font-medium text-company-secondary hover:bg-company-secondary-subtle hover:text-company-secondary transition-colors shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  {t("profile.createSuperAdmin")}
                </Link>
              )}
            </div>
            <div className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <div className="min-w-0">
                  <label className={LABEL}>{t("users.firstName")} <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                    <input value={form.firstName} onChange={setAndClearError("firstName")} placeholder={t("common.placeholderName")} className={IL} aria-invalid={!!errors.firstName} />
                  </div>
                  <div className="min-h-[1.25rem] mt-1">{errors.firstName && <p className="text-sm text-red-500" role="alert">{errors.firstName}</p>}</div>
                </div>
                <div className="min-w-0">
                  <label className={LABEL}>{t("users.lastName")} <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                    <input value={form.lastName} onChange={setAndClearError("lastName")} placeholder={t("common.placeholderLastName")} className={IL} aria-invalid={!!errors.lastName} />
                  </div>
                  <div className="min-h-[1.25rem] mt-1">{errors.lastName && <p className="text-sm text-red-500" role="alert">{errors.lastName}</p>}</div>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <label className={LABEL}>{t("users.email")} <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                    <input type="email" value={form.email} onChange={setAndClearError("email")} placeholder={t("common.placeholderEmail")} className={IL} aria-invalid={!!errors.email} />
                  </div>
                  <div className="min-h-[1.25rem] mt-1">{errors.email && <p className="text-sm text-red-500" role="alert">{errors.email}</p>}</div>
                </div>
                <div className="min-w-0">
                  <label className={LABEL}>{t("users.phone")}</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                    <input type="tel" value={form.phone} onChange={(e) => { setForm((p) => ({ ...p, phone: formatPhoneInternational(e.target.value) })); setErrors((prev) => ({ ...prev, phone: undefined })); }} placeholder="+1 234 567 8900" className={IL} aria-invalid={!!errors.phone} />
                  </div>
                  <div className="min-h-[1.25rem] mt-1">{errors.phone && <p className="text-sm text-red-500" role="alert">{errors.phone}</p>}</div>
                </div>
                <div className="min-w-0">
                  <label className={LABEL}>{t("users.timezone")}</label>
                  <SelectField value={form.timezone} onChange={set("timezone")} icon={Clock}>
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

          {/* Section 3 - Preferences: theme and language (full width), same style as settings */}
          <div className="bg-card/60 rounded-2xl overflow-hidden min-w-0 xl:col-span-2">
            <div className="px-6 py-4 bg-gradient-to-r from-violet-500/8 to-transparent">
              <p className="text-sm font-semibold text-text-primary">{t("profile.sectionPreferences")}</p>
              <p className="text-xs text-text-muted mt-1 break-words">{t("profile.sectionPreferencesDesc")}</p>
            </div>
            <div className="px-6 pb-6 pt-2">
              <div className="flex flex-col gap-6 md:flex-row md:gap-8 max-w-3xl">
                {/* Theme */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary mb-3">{t("profile.themeLabel")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleThemeChange("light")}
                      className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                        currentTheme === "light"
                          ? "border-company-primary bg-company-primary-subtle ring-1 ring-company-primary/30 shadow-sm"
                          : "border-input-border bg-input-bg/50 hover:border-company-primary-muted hover:bg-input-bg"
                      }`}
                    >
                      <span className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${currentTheme === "light" ? "bg-company-primary/15 text-company-primary" : "bg-input-bg text-text-muted"}`}>
                        <Sun className="w-5 h-5" />
                      </span>
                      <div className="w-full text-center space-y-0.5">
                        <p className={`text-sm font-medium ${currentTheme === "light" ? "text-company-primary" : "text-text-primary"}`}>
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
                        currentTheme === "dark"
                          ? "border-company-primary bg-company-primary-subtle ring-1 ring-company-primary/30 shadow-sm"
                          : "border-input-border bg-input-bg/50 hover:border-company-primary-muted hover:bg-input-bg"
                      }`}
                    >
                      <span className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${currentTheme === "dark" ? "bg-company-primary/15 text-company-primary" : "bg-input-bg text-text-muted"}`}>
                        <Moon className="w-5 h-5" />
                      </span>
                      <div className="w-full text-center space-y-0.5">
                        <p className={`text-sm font-medium ${currentTheme === "dark" ? "text-company-primary" : "text-text-primary"}`}>
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
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary mb-3">{t("profile.languageLabel")}</p>
                  <SelectField
                    value={currentLocale}
                    onChange={(e) => handleLocaleChange(e.target.value as LocaleValue)}
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
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-between gap-4 pt-4 flex-wrap border-t border-card-border mt-4 pt-4">
        <div />
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
            disabled={submitting || !isDirty || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {submitting ? <><LoadingSpinner size="sm" />{t("common.saving")}</> : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
