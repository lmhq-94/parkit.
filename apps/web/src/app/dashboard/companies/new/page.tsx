"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Receipt, Mail, Phone, Globe,
  DollarSign, Clock, MapPin,
} from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { AddressPickerModal } from "@/components/AddressPickerModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { useDashboardStore } from "@/lib/store";
import { COUNTRIES, CURRENCIES, TIMEZONES } from "@/lib/companyOptions";
import { formatTaxId, formatPhoneWithCountryCode } from "@/lib/inputMasks";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
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
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
        {children}
      </div>
    </div>
  );
}

const defaultForm = {
  legalName: "", taxId: "", commercialName: "",
  countryCode: "CR", currency: "CRC", timezone: "America/Costa_Rica",
  email: "", contactPhone: "", legalAddress: "",
};

export default function NewCompanyPage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const bumpCompanies = useDashboardStore((s) => s.bumpCompanies);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);

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
        email: form.email.trim() || undefined,
        contactPhone: form.contactPhone.replace(/\D/g, "").length > 0 ? form.contactPhone.replace(/\D/g, "") : undefined,
        legalAddress: form.legalAddress.trim() || undefined,
      });
      bumpCompanies();
      showSuccess(t("common.createSuccessShort"));
      router.push("/dashboard/companies");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear la empresa";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={t("companies.legalName")} required icon={Building2}>
            <input value={form.legalName} onChange={set("legalName")} placeholder={t("common.placeholderLegalName")} className={IL} />
          </Field>
          <Field label={t("companies.taxId")} required icon={Receipt}>
            <input value={form.taxId} onChange={(e) => setForm((p) => ({ ...p, taxId: formatTaxId(e.target.value) }))} placeholder={t("common.placeholderTaxId")} className={IL} />
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
          <Field label={t("companies.email")} icon={Mail}>
            <input type="email" value={form.email} onChange={set("email")} placeholder={t("common.placeholderEmail")} className={IL} />
          </Field>
          <Field label={t("companies.contactPhone")} icon={Phone}>
            <input type="tel" value={form.contactPhone} onChange={(e) => setForm((p) => ({ ...p, contactPhone: formatPhoneWithCountryCode(e.target.value, p.countryCode) }))} placeholder="+506 6216-4040" className={IL} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={LABEL}>{t("companies.legalAddress")}</label>
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input value={form.legalAddress} readOnly placeholder={t("common.placeholderAddress")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} />
              </div>
              <button
                type="button"
                onClick={() => setAddressPickerOpen(true)}
                className="shrink-0 px-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-secondary text-sm font-medium hover:bg-company-primary-subtle hover:border-company-primary-muted hover:text-company-primary transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
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
    <>
      <FormWizard
        steps={steps}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("companies.createCompany")}
        cancelHref="/dashboard/companies"
        error={error}
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
