"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, MailOpen, Shield } from "@/lib/premiumIcons";
import { FormWizard } from "@/components/FormWizard";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { required, email as validateEmail } from "@/lib/validation";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

const defaultForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export default function NewSuperAdminPage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = (): boolean => {
    const next: Partial<Record<keyof typeof defaultForm, string>> = {};
    const e1 = required(t, form.firstName); if (e1) next.firstName = e1;
    const e2 = required(t, form.lastName); if (e2) next.lastName = e2;
    const e3 = required(t, form.email) ?? validateEmail(t, form.email); if (e3) next.email = e3;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) return validate();
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post("/users/super-admin", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password.trim() ? form.password : undefined,
      });
      showSuccess(t("common.createSuccessShort"));
      router.push("/dashboard/profile");
    } catch (err) {
      const msg = getTranslatedApiErrorMessage(err, t);
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: t("superAdmins.newSuperAdmin"),
      description: t("superAdmins.newSuperAdminDescription"),
      badge: "required" as const,
      accentColor: "violet",
      isValid: () => !!(form.firstName.trim() && form.lastName.trim() && form.email.trim()),
      content: (
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
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={LABEL}>{t("users.password")}</label>
            <div className="relative group">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="password" value={form.password} onChange={set("password")} placeholder={t("common.placeholderPassword")} className={IL} autoComplete="new-password" />
            </div>
            <p className="text-xs premium-subtitle mt-1">{t("superAdmins.invitationNote")}</p>
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
      submitLabel={t("superAdmins.createSuperAdmin")}
      cancelHref="/dashboard/profile"
      error={error}
      onValidateBeforeAction={validateStep}
    />
  );
}
