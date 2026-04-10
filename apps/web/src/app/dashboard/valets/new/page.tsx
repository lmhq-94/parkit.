"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, MailOpen, CreditCard, ClipboardText, Car } from "@/lib/premiumIcons";
import { FormWizard } from "@/components/FormWizard";
import { MultiSelectField } from "@/components/MultiSelectField";
import { SelectField } from "@/components/SelectField";
import { DatePickerField } from "@/components/DatePickerField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { LICENSE_TYPES } from "@/lib/companyOptions";
import { required, email as validateEmail } from "@/lib/validation";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-all duration-200 ease-out focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary/20 focus:ring-inset placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

const STAFF_ROLES = ["RECEPTIONIST", "DRIVER"] as const;

const defaultForm = {
  firstName: "",
  lastName: "",
  email: "",
  licenseExpiry: "",
  staffRole: "RECEPTIONIST" as (typeof STAFF_ROLES)[number],
};

export default function NewValetPage() {
  const { t, tEnum } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [licenseTypes, setLicenseTypes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm | "licenseTypes", string>>>({});

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = (): boolean => {
    const next: Partial<Record<keyof typeof defaultForm | "licenseTypes", string>> = {};
    const e1 = required(t, form.firstName); if (e1) next.firstName = e1;
    const e2 = required(t, form.lastName); if (e2) next.lastName = e2;
    const e3 = required(t, form.email) ?? validateEmail(t, form.email); if (e3) next.email = e3;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      const next: Partial<Record<keyof typeof defaultForm | "licenseTypes", string>> = {};
      const e1 = required(t, form.firstName); if (e1) next.firstName = e1;
      const e2 = required(t, form.lastName); if (e2) next.lastName = e2;
      const e3 = required(t, form.email) ?? validateEmail(t, form.email); if (e3) next.email = e3;
      setErrors(next);
      return Object.keys(next).length === 0;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true); setError(null);
    try {
      const payload: Record<string, unknown> = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        staffRole: form.staffRole,
      };
      if (licenseTypes.length > 0) payload.licenseNumber = licenseTypes.join(", ");
      if (form.licenseExpiry) payload.licenseExpiry = new Date(form.licenseExpiry).toISOString();
      await apiClient.post("/valets", payload);
      showSuccess(t("common.createSuccessShort"));
      router.push("/dashboard/valets");
    } catch (err) {
      const msg = getTranslatedApiErrorMessage(err, t);
      setError(msg);
      showError(msg);
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
            <label className={LABEL}>{t("valets.staffRole")} <span className="text-red-500">*</span></label>
            <SelectField
              value={form.staffRole}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  staffRole: e.target.value as (typeof STAFF_ROLES)[number],
                }))
              }
              icon={form.staffRole === "DRIVER" ? Car : ClipboardText}
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {tEnum("valetStaffRole", r)}
                </option>
              ))}
            </SelectField>
          </div>
        </div>
      ),
    },
    {
      title: t("valets.sectionLicense"),
      description: t("valets.sectionLicenseDesc"),
      accentColor: "sky",
      isValid: () => true,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("valets.licenseType")}</label>
            <MultiSelectField
              value={licenseTypes}
              onChange={setLicenseTypes}
              options={[...LICENSE_TYPES]}
              icon={CreditCard}
              placeholder={t("common.selectPlaceholder")}
            />
            <div className="min-h-[1.25rem] mt-1">{errors.licenseTypes && <p className="text-sm text-red-500" role="alert">{errors.licenseTypes}</p>}</div>
          </div>
          <div>
            <label className={LABEL}>{t("valets.licenseExpiry")}</label>
            <DatePickerField
              value={form.licenseExpiry}
              onChange={v => setForm(p => ({ ...p, licenseExpiry: v }))}
            />
            <div className="min-h-[1.25rem] mt-1">{errors.licenseExpiry && <p className="text-sm text-red-500" role="alert">{errors.licenseExpiry}</p>}</div>
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
      onValidateBeforeAction={validateStep}
    />
  );
}
