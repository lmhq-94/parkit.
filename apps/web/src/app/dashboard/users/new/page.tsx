"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCircle, MailOpen, Phone, Clock, Shield } from "@/lib/premiumIcons";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { TIMEZONES, getLocalTimezone } from "@/lib/companyOptions";
import { formatPhoneWithCountryCode, COUNTRY_DIAL_CODES, getDeviceCountryCode } from "@/lib/inputMasks";
import { required, email as validateEmail, phone as validatePhone } from "@/lib/validation";
import { isSuperAdmin } from "@/lib/auth";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";
const ROLES = ["CUSTOMER", "ADMIN"] as const;

const defaultForm = {
  firstName: "", lastName: "", email: "",
  systemRole: "CUSTOMER" as const, phone: "",
  timezone: getLocalTimezone(),
};

export default function NewUserPage() {
  const { t, tEnum } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyId = useDashboardStore((s) => s.selectedCompanyId);
  const roleParam = (searchParams.get("role") || "").toUpperCase();
  const initialRole: (typeof ROLES)[number] =
    roleParam === "ADMIN" ? "ADMIN" : "CUSTOMER";
  const isFixedRole = roleParam === "ADMIN" || roleParam === "CUSTOMER";

  const [form, setForm] = useState(() => ({
    ...defaultForm,
    systemRole: initialRole,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
  const [phoneCountry, setPhoneCountry] = useState<string>("CR");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const superAdmin = isSuperAdmin(user);
        let company: { countryCode?: string | null } | null = null;
        if (superAdmin && selectedCompanyId) {
          company = await apiClient.get(`/companies/${selectedCompanyId}`);
        } else if (!superAdmin) {
          company = await apiClient.get("/companies/me");
        }
        const countryCode =
          (company && company.countryCode) || getDeviceCountryCode() || "CR";
        if (!cancelled) setPhoneCountry(countryCode);
      } catch {
        if (!cancelled) setPhoneCountry(getDeviceCountryCode() || "CR");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, selectedCompanyId]);

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

  /** Valida solo los campos del paso indicado (0 = datos principales, 1 = contacto opcional). */
  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      const next: Partial<Record<keyof typeof defaultForm, string>> = {};
      const e1 = required(t, form.firstName); if (e1) next.firstName = e1;
      const e2 = required(t, form.lastName); if (e2) next.lastName = e2;
      const e3 = required(t, form.email) ?? validateEmail(t, form.email); if (e3) next.email = e3;
      setErrors(next);
      return Object.keys(next).length === 0;
    }
    if (stepIndex === 1) {
      const next: Partial<Record<keyof typeof defaultForm, string>> = {};
      if (form.phone.trim()) { const ep = validatePhone(t, form.phone); if (ep) next.phone = ep; }
      setErrors(next);
      return Object.keys(next).length === 0;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.post("/users", {
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        email: form.email.trim(),
        systemRole: form.systemRole,
        phone: form.phone.replace(/\D/g, "").length > 0 ? form.phone.replace(/\D/g, "") : undefined,
        timezone: form.timezone.trim() || undefined,
      });
      showSuccess(t("common.createSuccessShort"));
      router.push("/dashboard/users");
    } catch (err) {
      const msg = getTranslatedApiErrorMessage(err, t);
      setError(msg);
      showError(msg);
    } finally { setSubmitting(false); }
  };

  const steps = [
    {
      title: t("users.sectionMain"),
      description: t("users.sectionMainDesc"),
      badge: "required" as const,
      accentColor: "violet",
      isValid: () => !!(form.firstName.trim() && form.lastName.trim() && form.email.trim()),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("users.firstName")} <span className="text-red-500">*</span></label>
            <div className="relative group">
              <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input value={form.firstName} onChange={set("firstName")} placeholder={t("common.placeholderName")} className={IL} aria-invalid={!!errors.firstName} />
            </div>
            <div className="min-h-[1.25rem] mt-1">{errors.firstName && <p className="text-sm text-red-500" role="alert">{errors.firstName}</p>}</div>
          </div>
          <div>
            <label className={LABEL}>{t("users.lastName")} <span className="text-red-500">*</span></label>
            <div className="relative group">
              <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
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
            {isFixedRole ? (
              <p className="mt-2 text-sm font-medium text-text-secondary">
                {tEnum("systemRole", form.systemRole)}
              </p>
            ) : (
              <SelectField value={form.systemRole} onChange={set("systemRole")} icon={Shield}>
                {ROLES.map(r => <option key={r} value={r}>{tEnum("systemRole", r)}</option>)}
              </SelectField>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t("users.sectionContact"),
      description: t("users.sectionContactDesc"),
      accentColor: "indigo",
      isValid: () => true,
      content: (
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
      ),
    },
  ];

  return (
    <FormWizard
      steps={steps}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel={t("users.createUser")}
      cancelHref="/dashboard/users"
      error={error}
      footerNote={t("users.invitationNote")}
      onValidateBeforeAction={validateStep}
    />
  );
}
