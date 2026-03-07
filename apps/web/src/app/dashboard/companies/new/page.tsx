"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Receipt, Mail, Phone, Globe,
  DollarSign, Clock, MapPin,
} from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useDashboardStore } from "@/lib/store";
import { COUNTRIES, CURRENCIES, TIMEZONES } from "@/lib/companyOptions";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

function Field({ label, required, icon: Icon, children }: {
  label: string; required?: boolean;
  icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div>
      <label className={LABEL}>
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
        {children}
      </div>
    </div>
  );
}

const defaultForm = {
  legalName: "", taxId: "", commercialName: "",
  countryCode: "CR", currency: "CRC", timezone: "America/Costa_Rica",
  billingEmail: "", contactPhone: "", legalAddress: "",
};

export default function NewCompanyPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const bumpCompanies = useDashboardStore((s) => s.bumpCompanies);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.legalName.trim() || !form.taxId.trim()) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.post("/companies", {
        legalName: form.legalName.trim(),
        taxId: form.taxId.trim(),
        commercialName: form.commercialName.trim() || undefined,
        countryCode: form.countryCode || undefined,
        currency: form.currency || undefined,
        timezone: form.timezone || undefined,
        billingEmail: form.billingEmail.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        legalAddress: form.legalAddress.trim() || undefined,
      });
      bumpCompanies();
      router.push("/dashboard/companies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la empresa");
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={t("companies.legalName")} required icon={Building2}>
            <input value={form.legalName} onChange={set("legalName")} placeholder={t("common.placeholderLegalName")} className={IL} />
          </Field>
          <Field label={t("companies.taxId")} required icon={Receipt}>
            <input value={form.taxId} onChange={set("taxId")} placeholder={t("common.placeholderTaxId")} className={IL} />
          </Field>
        </div>
      ),
    },
    {
      title: t("companies.sectionContact"),
      description: t("companies.sectionContactDesc"),
      badge: "optional" as const,
      accentColor: "indigo",
      isValid: () => true,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label={t("companies.commercialName")} icon={Building2}>
            <input value={form.commercialName} onChange={set("commercialName")} placeholder={t("common.placeholderCommercialName")} className={IL} />
          </Field>
          <Field label={t("companies.billingEmail")} icon={Mail}>
            <input type="email" value={form.billingEmail} onChange={set("billingEmail")} placeholder={t("common.placeholderEmail")} className={IL} />
          </Field>
          <Field label={t("companies.contactPhone")} icon={Phone}>
            <input value={form.contactPhone} onChange={set("contactPhone")} placeholder={t("common.placeholderPhone")} className={IL} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={LABEL}>{t("companies.legalAddress")}</label>
            <div className="relative group">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
              <input value={form.legalAddress} onChange={set("legalAddress")} placeholder={t("common.placeholderAddress")} className={IL} />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("companies.sectionRegional"),
      description: t("companies.sectionRegionalDesc"),
      badge: "optional" as const,
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
  ];

  return (
    <FormWizard
      steps={steps}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel={t("companies.createCompany")}
      cancelHref="/dashboard/companies"
      error={error}
    />
  );
}
