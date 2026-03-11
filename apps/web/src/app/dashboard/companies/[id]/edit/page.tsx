"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2, Receipt, Mail, Phone, Globe,
  DollarSign, Clock, MapPin, ArrowRight,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { useDashboardStore } from "@/lib/store";
import { PageLoader } from "@/components/PageLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SelectField } from "@/components/SelectField";
import { AddressPickerModal } from "@/components/AddressPickerModal";
import { COUNTRIES, CURRENCIES, TIMEZONES, INDUSTRIES } from "@/lib/companyOptions";
import { formatTaxId, formatPhoneInternational } from "@/lib/inputMasks";
import { required, email as validateEmail, phone as validatePhone } from "@/lib/validation";

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
  legalName: "", taxId: "", industry: "", commercialName: "",
  countryCode: "", currency: "", timezone: "",
  email: "", contactPhone: "", legalAddress: "",
};

export default function EditCompanyPage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const params = useParams();
  const bumpCompanies = useDashboardStore((s) => s.bumpCompanies);
  const id = params.id as string;
  const [form, setForm] = useState(defaultForm);
  const [initialForm, setInitialForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.get<Record<string, unknown>>(`/companies/${id}`);
        if (data) {
          const loaded = {
            legalName: String(data.legalName ?? ""),
            taxId: formatTaxId(String(data.taxId ?? "")),
            industry: String(data.industry ?? ""),
            commercialName: String(data.commercialName ?? ""),
            countryCode: String(data.countryCode ?? ""),
            currency: String(data.currency ?? ""),
            timezone: String(data.timezone ?? ""),
            email: String(data.email ?? ""),
            contactPhone: formatPhoneInternational(String(data.contactPhone ?? "")),
            legalAddress: String(data.legalAddress ?? ""),
          };
          setForm(loaded);
          setInitialForm(loaded);
        }
      } catch {
        setError("Error al cargar los datos");
        showError(t("common.loadError"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = (): boolean => {
    const next: Partial<Record<keyof typeof defaultForm, string>> = {};
    const e1 = required(t, form.legalName); if (e1) next.legalName = e1;
    const e2 = required(t, form.taxId); if (e2) next.taxId = e2;
    if (form.email.trim()) { const ee = validateEmail(t, form.email); if (ee) next.email = ee; }
    if (form.contactPhone.trim()) { const ep = validatePhone(t, form.contactPhone); if (ep) next.contactPhone = ep; }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.patch(`/companies/${id}`, {
        legalName: form.legalName.trim(),
        taxId: form.taxId.trim(),
        industry: form.industry.trim() || undefined,
        commercialName: form.commercialName.trim() || undefined,
        countryCode: form.countryCode || undefined,
        currency: form.currency || undefined,
        timezone: form.timezone || undefined,
        email: form.email.trim() || undefined,
        contactPhone: form.contactPhone.replace(/\D/g, "").length > 0 ? form.contactPhone.replace(/\D/g, "") : undefined,
        legalAddress: form.legalAddress.trim() || undefined,
      });
      bumpCompanies();
      showSuccess(t("common.saveSuccessShort"));
      router.push("/dashboard/companies");
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar la empresa";
      setError(msg);
      showError(msg);
    }
    setSubmitting(false);
  };

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm]
  );
  const isValid =
    form.legalName.trim() &&
    form.taxId.trim() &&
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

      {/* Sección — datos legales */}
      <div className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("companies.sectionMain")}</p>
            <span className="text-[10px] font-semibold text-red-500">{t("common.requiredBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("companies.sectionMainDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label={t("companies.legalName")} required icon={Building2}>
              <input value={form.legalName} onChange={set("legalName")} placeholder={t("common.placeholderLegalName")} className={IL} aria-invalid={!!errors.legalName} />
              {errors.legalName && <p className="mt-1 text-sm text-red-500">{errors.legalName}</p>}
            </Field>
            <Field label={t("companies.taxId")} required icon={Receipt}>
              <input value={form.taxId} onChange={(e) => setForm((p) => ({ ...p, taxId: formatTaxId(e.target.value) }))} placeholder={t("common.placeholderTaxId")} className={IL} aria-invalid={!!errors.taxId} />
              {errors.taxId && <p className="mt-1 text-sm text-red-500">{errors.taxId}</p>}
            </Field>
            <Field label={t("companies.industry")} icon={Building2}>
              <SelectField value={form.industry} onChange={set("industry")} icon={Building2}>
                <option value="">{t("common.selectPlaceholder")}</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {t(`companies.industryOptions.${ind.value}`)}
                  </option>
                ))}
              </SelectField>
            </Field>
          </div>
        </div>
      </div>

      {/* Sección — contacto */}
      <div className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("companies.sectionContact")}</p>
            <span className="text-[10px] font-semibold text-company-tertiary">{t("common.optionalBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("companies.sectionContactDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label={t("companies.commercialName")} icon={Building2}>
              <input value={form.commercialName} onChange={set("commercialName")} placeholder={t("common.placeholderCommercialName")} className={IL} />
            </Field>
            <Field label={t("companies.email")} icon={Mail}>
              <input type="email" value={form.email} onChange={set("email")} placeholder={t("common.placeholderEmail")} className={IL} aria-invalid={!!errors.email} />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </Field>
            <Field label={t("companies.contactPhone")} icon={Phone}>
              <input type="tel" value={form.contactPhone} onChange={(e) => setForm((p) => ({ ...p, contactPhone: formatPhoneInternational(e.target.value) }))} placeholder="+1 234 567 8900" className={IL} aria-invalid={!!errors.contactPhone} />
              {errors.contactPhone && <p className="mt-1 text-sm text-red-500">{errors.contactPhone}</p>}
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
              <AddressPickerModal
                open={addressPickerOpen}
                onClose={() => setAddressPickerOpen(false)}
                onSelect={(address) => { setForm((p) => ({ ...p, legalAddress: address })); setAddressPickerOpen(false); }}
                initialValue={form.legalAddress}
                countryCode={form.countryCode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección — configuración regional */}
      <div className="overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("companies.sectionRegional")}</p>
            <p className="text-xs text-text-muted">{t("companies.sectionRegionalDesc")}</p>
          </div>
        </div>
        <div className="p-6 pt-4">
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
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/companies"
            className="px-5 py-3 rounded-lg border border-company-secondary-muted text-sm font-medium text-company-secondary hover:bg-company-secondary-subtle hover:text-company-secondary transition-colors">
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
