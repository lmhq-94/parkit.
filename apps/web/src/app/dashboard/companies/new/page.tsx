"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building, Receipt, Mail, Phone, Globe,
  DollarSign, Clock, World, Navigation,
} from "@/lib/premiumIcons";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { AddressPickerModal } from "@/components/AddressPickerModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { useDashboardStore } from "@/lib/store";
import { COUNTRIES, CURRENCIES, TIMEZONES, INDUSTRIES, getLocalTimezone } from "@/lib/companyOptions";
import { getIndustryIcon } from "@/lib/companyIcons";
import { formatTaxId, formatPhoneWithCountryCode, COUNTRY_DIAL_CODES } from "@/lib/inputMasks";
import { required, email as validateEmail, phone as validatePhone } from "@/lib/validation";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-all duration-200 ease-out focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary/20 focus:ring-inset placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

function Field({ label, required, icon: Icon, error, children }: {
  label: string; required?: boolean;
  icon: React.ElementType; error?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div>
      <label className={LABEL}>
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
        {children}
      </div>
      <div className="min-h-[1.25rem] mt-1">{error != null && error !== "" && <p className="text-sm text-red-500" role="alert">{error}</p>}</div>
    </div>
  );
}

const defaultForm = {
  legalName: "", taxId: "", industry: "", commercialName: "",
  countryCode: "CR", currency: "CRC", timezone: getLocalTimezone(),
  email: "", contactPhone: "", legalAddress: "",
  requiresCustomerApp: "" as "" | "true" | "false",
};

export default function NewCompanyPage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bumpCompanies = useDashboardStore((s) => s.bumpCompanies);
  const setSelectedCompany = useDashboardStore((s) => s.setSelectedCompany);
  const isFirstCompanyFlow = searchParams?.get("first") === "1";
  const [hasExistingCompanies, setHasExistingCompanies] = useState<boolean | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);

  // Check if there are existing companies when in first company flow
  useEffect(() => {
    if (isFirstCompanyFlow) {
      apiClient.get<{ id: string }[]>("/companies")
        .then(data => setHasExistingCompanies(Array.isArray(data) && data.length > 0))
        .catch(() => setHasExistingCompanies(true)); // Assume true on error
    }
  }, [isFirstCompanyFlow]);

  // Determine cancel href: if first flow and no companies, go to no-companies page
  const cancelHref = isFirstCompanyFlow && hasExistingCompanies === false
    ? "/dashboard/no-companies"
    : "/dashboard/companies";

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  // Sort industries alphabetically by translated label, keeping OTHER at the end
  const sortedIndustries = useMemo(() => {
    return [...INDUSTRIES].sort((a, b) => {
      if (a.value === "OTHER") return 1;
      if (b.value === "OTHER") return -1;
      const labelA = t(`companies.industryOptions.${a.value}`);
      const labelB = t(`companies.industryOptions.${b.value}`);
      return labelA.localeCompare(labelB);
    });
  }, [t]);

  const validate = (): boolean => {
    const next: Partial<Record<keyof typeof defaultForm, string>> = {};
    const e1 = required(t, form.legalName); if (e1) next.legalName = e1;
    const e2 = required(t, form.taxId); if (e2) next.taxId = e2;
    const e3 = required(t, form.industry); if (e3) next.industry = e3;
    const e4 = required(t, form.commercialName?.trim()); if (e4) next.commercialName = e4;
    const e5 = required(t, form.email?.trim()); if (e5) next.email = e5;
    else if (form.email.trim()) { const ee = validateEmail(t, form.email); if (ee) next.email = ee; }
    if (!form.requiresCustomerApp) {
      next.requiresCustomerApp = required(t, form.requiresCustomerApp);
    }
    if (form.contactPhone.trim()) { const ep = validatePhone(t, form.contactPhone); if (ep) next.contactPhone = ep; }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      const next: Partial<Record<keyof typeof defaultForm, string>> = {};
      const e1 = required(t, form.legalName); if (e1) next.legalName = e1;
      const e2 = required(t, form.taxId); if (e2) next.taxId = e2;
      const e3 = required(t, form.industry); if (e3) next.industry = e3;
      setErrors(next);
      return Object.keys(next).length === 0;
    }
    if (stepIndex === 1) {
      const next: Partial<Record<keyof typeof defaultForm, string>> = {};
      const ec = required(t, form.commercialName?.trim()); if (ec) next.commercialName = ec;
      const em = required(t, form.email?.trim()); if (em) next.email = em;
      else if (form.email.trim()) { const ee = validateEmail(t, form.email); if (ee) next.email = ee; }
      if (form.contactPhone.trim()) { const ep = validatePhone(t, form.contactPhone); if (ep) next.contactPhone = ep; }
      setErrors(next);
      return Object.keys(next).length === 0;
    }
    if (stepIndex === 3) {
      const next: Partial<Record<keyof typeof defaultForm, string>> = {};
      if (!form.requiresCustomerApp) {
        next.requiresCustomerApp = required(t, form.requiresCustomerApp);
      }
      setErrors(next);
      return Object.keys(next).length === 0;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true); setError(null);
    try {
      const company = await apiClient.post<{ id: string; commercialName?: string | null; legalName: string }>("/companies", {
        legalName: form.legalName.trim(),
        taxId: form.taxId.trim(),
        industry: form.industry || undefined,
        commercialName: form.commercialName.trim() || undefined,
        countryCode: form.countryCode || undefined,
        currency: form.currency || undefined,
        timezone: form.timezone || undefined,
        email: form.email.trim() || undefined,
        contactPhone: form.contactPhone.replace(/\D/g, "").length > 0 ? form.contactPhone.replace(/\D/g, "") : undefined,
        legalAddress: form.legalAddress.trim() || undefined,
        requiresCustomerApp: form.requiresCustomerApp === "true",
      });
      const displayName = (company.commercialName?.trim() || company.legalName || "").trim() || form.legalName.trim();
      setSelectedCompany(company.id, displayName);
      bumpCompanies();
      showSuccess(t("common.createSuccessShort"));
      router.push("/dashboard/companies");
    } catch (err) {
      const msg = getTranslatedApiErrorMessage(err, t) || t("apiErrors.requestFailed");
      setError(msg);
      showError(msg);
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: t("companies.sectionMain"),
      description: t("companies.sectionMainDesc"),
      badge: "required" as const,
      accentColor: "sky",
      isValid: () => !!(form.legalName.trim() && form.taxId.trim()),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label={t("companies.legalName")} required icon={Building} error={errors.legalName}>
            <input value={form.legalName} onChange={set("legalName")} placeholder={t("common.placeholderLegalName")} className={IL} aria-invalid={!!errors.legalName} />
          </Field>
          <Field label={t("companies.taxId")} required icon={Receipt} error={errors.taxId}>
            <input value={form.taxId} onChange={(e) => setForm((p) => ({ ...p, taxId: formatTaxId(e.target.value) }))} placeholder={t("common.placeholderTaxId")} className={IL} aria-invalid={!!errors.taxId} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-1">
            <Field label={t("companies.industry")} required icon={form.industry ? getIndustryIcon(form.industry) : Building} error={errors.industry}>
              <SelectField value={form.industry} onChange={set("industry")} icon={form.industry ? getIndustryIcon(form.industry) : Building}>
                <option value="">{t("common.selectPlaceholder")}</option>
                {sortedIndustries.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {t(`companies.industryOptions.${ind.value}`)}
                  </option>
                ))}
              </SelectField>
            </Field>
          </div>
        </div>
      ),
    },
    {
      title: t("companies.sectionContact"),
      description: t("companies.sectionContactDesc"),
      badge: "required" as const,
      accentColor: "indigo",
      isValid: () => !!(form.commercialName?.trim() && form.email?.trim()),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label={t("companies.commercialName")} required icon={Building} error={errors.commercialName}>
            <input value={form.commercialName} onChange={set("commercialName")} placeholder={t("common.placeholderCommercialName")} className={IL} aria-invalid={!!errors.commercialName}/>
          </Field>
          <Field label={t("companies.email")} required icon={Mail} error={errors.email}>
            <input type="email" value={form.email} onChange={set("email")} placeholder={t("common.placeholderEmail")} className={IL} aria-invalid={!!errors.email} />
          </Field>
          <Field label={t("companies.contactPhone")} icon={Phone} error={errors.contactPhone}>
            <input type="tel" value={form.contactPhone} onChange={(e) => setForm((p) => ({ ...p, contactPhone: formatPhoneWithCountryCode(e.target.value, form.countryCode) }))} placeholder={`+${COUNTRY_DIAL_CODES[form.countryCode] || "1"}`} className={IL} aria-invalid={!!errors.contactPhone} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={LABEL}>{t("companies.legalAddress")}</label>
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input value={form.legalAddress} readOnly placeholder={t("common.placeholderAddress")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} />
              </div>
              <button
                type="button"
                onClick={() => setAddressPickerOpen(true)}
                className="shrink-0 px-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-secondary text-sm font-medium hover:bg-company-primary-subtle hover:border-company-primary-muted hover:text-company-primary transition-colors flex items-center gap-2"
              >
                <World className="w-4 h-4" />
                {t("companies.pickAddressOnMap")}
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("companies.sectionRegional"),
      description: t("companies.sectionRegionalDesc"),
      accentColor: "emerald",
      isValid: () => true,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("companies.countryCode")}</label>
            <SelectField value={form.countryCode} onChange={set("countryCode")} icon={Globe}>
              <option value="">{t("common.selectPlaceholder")}</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </SelectField>
          </div>
          <div>
            <label className={LABEL}>{t("companies.currency")}</label>
            <SelectField value={form.currency} onChange={set("currency")} icon={DollarSign}>
              <option value="">{t("common.selectPlaceholder")}</option>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </SelectField>
          </div>
          <div>
            <label className={LABEL}>{t("companies.timezone")}</label>
            <SelectField value={form.timezone} onChange={set("timezone")} icon={Clock}>
              <option value="">{t("common.selectPlaceholder")}</option>
              {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
            </SelectField>
          </div>
        </div>
      ),
    },
    {
      title: t("companies.channelTitle"),
      description: t("companies.channelDescription"),
      badge: "required" as const,
      accentColor: "amber",
      isValid: () => true,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, requiresCustomerApp: "true" }))}
              className={`flex flex-col items-start gap-1.5 rounded-lg border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-company-primary ${
                form.requiresCustomerApp === "true"
                  ? "border-company-primary bg-company-primary-muted text-company-primary"
                  : "border-input-border bg-input-bg text-text-primary hover:border-company-primary-muted"
              }`}
            >
              <span className="font-medium">
                {t("companies.channelOptionWithAppTitle")}
              </span>
              <span className={form.requiresCustomerApp === "true" ? "text-xs text-text-secondary" : "text-xs text-text-muted"}>
                {t("companies.channelOptionWithAppDescription")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, requiresCustomerApp: "false" }))}
              className={`flex flex-col items-start gap-1.5 rounded-lg border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-company-primary ${
                form.requiresCustomerApp === "false"
                  ? "border-company-primary bg-company-primary-muted text-company-primary"
                  : "border-input-border bg-input-bg text-text-primary hover:border-company-primary-muted"
              }`}
            >
              <span className="font-medium">
                {t("companies.channelOptionNoAppTitle")}
              </span>
              <span className={form.requiresCustomerApp === "false" ? "text-xs text-text-secondary" : "text-xs text-text-muted"}>
                {t("companies.channelOptionNoAppDescription")}
              </span>
            </button>
          </div>
      ),
    },
  ];

  return (
    <>
      <FormWizard
        steps={steps}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("companies.createCompany")}
        cancelHref={cancelHref}
        error={error}
        onValidateBeforeAction={validateStep}
      />
      <AddressPickerModal
        open={addressPickerOpen}
        onClose={() => setAddressPickerOpen(false)}
        onSelect={(address) => { setForm((p) => ({ ...p, legalAddress: address })); setAddressPickerOpen(false); }}
        initialValue={form.legalAddress}
        countryCode={form.countryCode}
      />
    </>
  );
}
