"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User, MailOpen, Phone, Clock, Shield, ArrowRight } from "@/lib/premiumIcons";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { PageLoader } from "@/components/PageLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TIMEZONES } from "@/lib/companyOptions";
import {
  formatPhoneWithCountryCode,
  COUNTRY_DIAL_CODES,
  getDeviceCountryCode,
} from "@/lib/inputMasks";
import { required, email as validateEmail, phone as validatePhone } from "@/lib/validation";
import { isSuperAdmin } from "@/lib/auth";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";
const ROLES = ["CUSTOMER", "ADMIN"] as const;

const defaultForm = {
  firstName: "", lastName: "", email: "",
  systemRole: "CUSTOMER", phone: "",
  timezone: "",
};

export default function EditUserPage() {
  const { t, tEnum } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const user = useAuthStore((s) => s.user);
  const selectedCompanyId = useDashboardStore((s) => s.selectedCompanyId);
  const [form, setForm] = useState(defaultForm);
  const [initialForm, setInitialForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
  const [phoneCountry, setPhoneCountry] = useState<string>("CR");

  useEffect(() => {
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
          apiClient.get<Record<string, unknown>>(`/users/${id}`),
          companyPromise,
        ]);
        const countryCode =
          (company && typeof company === "object" && "countryCode" in company && company.countryCode) ||
          getDeviceCountryCode() ||
          "CR";
        setPhoneCountry(countryCode);
        if (data) {
          const role = String(data.systemRole ?? "STAFF");
          const loaded = {
            firstName: String(data.firstName ?? ""),
            lastName: String(data.lastName ?? ""),
            email: String(data.email ?? ""),
            systemRole: ROLES.includes(role as (typeof ROLES)[number]) ? role : "ADMIN",
            phone: formatPhoneWithCountryCode(String(data.phone ?? ""), countryCode),
            timezone: String(data.timezone ?? ""),
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
  }, [id, showError, t, user, selectedCompanyId]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

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
    setSubmitting(true); setError(null);
    try {
      await apiClient.patch(`/users/${id}`, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        systemRole: form.systemRole,
        phone: form.phone.replace(/\D/g, "").length > 0 ? form.phone.replace(/\D/g, "") : undefined,
        timezone: form.timezone.trim() || undefined,
      });
      showSuccess(t("common.saveSuccessShort"));
      router.push("/dashboard/users");
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
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    Object.keys(errors).length === 0;

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
            <p className="text-sm premium-section-title">{t("users.sectionMain")}</p>
            <span className="text-[11px] font-medium text-red-500">{t("common.requiredBadge")}</span>
          </div>
          <p className="text-xs premium-subtitle mt-1">{t("users.sectionMainDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("users.firstName")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input value={form.firstName} onChange={set("firstName")} placeholder={t("common.placeholderName")} className={IL} aria-invalid={!!errors.firstName} />
              </div>
              <div className="min-h-[1.25rem] mt-1">{errors.firstName && <p className="text-sm text-red-500" role="alert">{errors.firstName}</p>}</div>
            </div>
            <div>
              <label className={LABEL}>{t("users.lastName")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input value={form.lastName} onChange={set("lastName")} placeholder={t("common.placeholderLastName")} className={IL} aria-invalid={!!errors.lastName} />
              </div>
              <div className="min-h-[1.25rem] mt-1">{errors.lastName && <p className="text-sm text-red-500" role="alert">{errors.lastName}</p>}</div>
            </div>
            <div>
              <label className={LABEL}>{t("users.email")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <MailOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input type="email" value={form.email} onChange={set("email")} placeholder={t("common.placeholderEmail")} className={IL} aria-invalid={!!errors.email} />
              </div>
              <div className="min-h-[1.25rem] mt-1">{errors.email && <p className="text-sm text-red-500" role="alert">{errors.email}</p>}</div>
            </div>
            <div>
              <label className={LABEL}>{t("users.role")}</label>
              <SelectField value={form.systemRole} onChange={set("systemRole")} icon={Shield}>
                {ROLES.map(r => <option key={r} value={r}>{tEnum("systemRole", r)}</option>)}
              </SelectField>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm premium-section-title">{t("users.sectionContact")}</p>
            <span className="text-[11px] font-medium text-text-muted">{t("common.optionalBadge")}</span>
          </div>
          <p className="text-xs premium-subtitle mt-1">{t("users.sectionContactDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("users.phone")}</label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: formatPhoneWithCountryCode(e.target.value, phoneCountry) }))
                  }
                  placeholder={`+${COUNTRY_DIAL_CODES[phoneCountry] || "1"}`}
                  className={IL}
                  aria-invalid={!!errors.phone}
                />
              </div>
              <div className="min-h-[1.25rem] mt-1">{errors.phone && <p className="text-sm text-red-500" role="alert">{errors.phone}</p>}</div>
            </div>
            <div>
              <label className={LABEL}>{t("users.timezone")}</label>
              <SelectField value={form.timezone} onChange={set("timezone")} icon={Clock}>
                <option value="">{t("common.selectPlaceholder")}</option>
                {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </SelectField>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/users"
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
