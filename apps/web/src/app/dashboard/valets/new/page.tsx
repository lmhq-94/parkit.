"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, CreditCard } from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { MultiSelectField } from "@/components/MultiSelectField";
import { DatePickerField } from "@/components/DatePickerField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient, getApiErrorMessage } from "@/lib/api";
import { LICENSE_TYPES } from "@/lib/companyOptions";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

const defaultForm = { firstName: "", lastName: "", email: "", licenseExpiry: "" };

export default function NewValetPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [licenseTypes, setLicenseTypes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() ||
        licenseTypes.length === 0 || !form.licenseExpiry) return;
    setSubmitting(true); setError(null);
    try {
      const userRes = await apiClient.post<{ id: string }>("/users", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        systemRole: "STAFF",
      });
      await apiClient.post("/valets", {
        userId: userRes.id,
        licenseNumber: licenseTypes.join(", "),
        licenseExpiry: new Date(form.licenseExpiry).toISOString(),
      });
      router.push("/dashboard/valets");
    } catch (err) {
      setError(getApiErrorMessage(err));
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: t("valets.sectionEmployee"),
      description: t("valets.sectionEmployeeDesc"),
      badge: "required" as const,
      accentColor: "emerald",
      isValid: () => !!(form.firstName.trim() && form.lastName.trim() && form.email.trim()),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("users.firstName")} <span className="text-red-500">*</span></label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
              <input value={form.firstName} onChange={set("firstName")} placeholder={t("common.placeholderName")} className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("users.lastName")} <span className="text-red-500">*</span></label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
              <input value={form.lastName} onChange={set("lastName")} placeholder={t("common.placeholderLastName")} className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("users.email")} <span className="text-red-500">*</span></label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
              <input type="email" value={form.email} onChange={set("email")} placeholder={t("common.placeholderEmail")} className={IL} />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("valets.sectionLicense"),
      description: t("valets.sectionLicenseDesc"),
      badge: "required" as const,
      accentColor: "sky",
      isValid: () => licenseTypes.length > 0 && !!form.licenseExpiry,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("valets.licenseType")} <span className="text-red-500">*</span></label>
            <MultiSelectField
              value={licenseTypes}
              onChange={setLicenseTypes}
              options={[...LICENSE_TYPES]}
              icon={CreditCard}
              placeholder={t("common.selectPlaceholder")}
            />
          </div>
          <div>
            <label className={LABEL}>{t("valets.licenseExpiry")} <span className="text-red-500">*</span></label>
            <DatePickerField
              value={form.licenseExpiry}
              onChange={v => setForm(p => ({ ...p, licenseExpiry: v }))}
            />
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
      submitLabel={t("valets.createValet")}
      cancelHref="/dashboard/valets"
      error={error}
      footerNote={t("users.invitationNote")}
    />
  );
}
