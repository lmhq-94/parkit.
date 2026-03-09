"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Clock, Shield } from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient, getApiErrorMessage } from "@/lib/api";
import { TIMEZONES } from "@/lib/companyOptions";
import { formatPhoneWithCountryCode } from "@/lib/inputMasks";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";
const ROLES = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"] as const;

const defaultForm = {
  firstName: "", lastName: "", email: "",
  systemRole: "CUSTOMER" as const, phone: "",
  timezone: "America/Costa_Rica",
};

export default function NewUserPage() {
  const { t, tEnum } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.post("/users", {
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        email: form.email.trim(),
        systemRole: form.systemRole,
        phone: form.phone.replace(/\D/g, "").length > 0 ? form.phone.replace(/\D/g, "") : undefined,
        timezone: form.timezone.trim() || undefined,
      });
      router.push("/dashboard/users");
    } catch (err) {
      setError(getApiErrorMessage(err));
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
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input value={form.firstName} onChange={set("firstName")} placeholder={t("common.placeholderName")} className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("users.lastName")} <span className="text-red-500">*</span></label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input value={form.lastName} onChange={set("lastName")} placeholder={t("common.placeholderLastName")} className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("users.email")} <span className="text-red-500">*</span></label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="email" value={form.email} onChange={set("email")} placeholder={t("common.placeholderEmail")} className={IL} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("users.role")}</label>
            <SelectField value={form.systemRole} onChange={set("systemRole")} icon={Shield}>
              {ROLES.map(r => <option key={r} value={r}>{tEnum("systemRole", r)}</option>)}
            </SelectField>
          </div>
        </div>
      ),
    },
    {
      title: t("users.sectionContact"),
      description: t("users.sectionContactDesc"),
      badge: "optional" as const,
      accentColor: "indigo",
      isValid: () => true,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("users.phone")}</label>
            <div className="relative group">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: formatPhoneWithCountryCode(e.target.value, "CR") }))} placeholder="+506 6216-4040" className={IL} />
            </div>
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
    />
  );
}
