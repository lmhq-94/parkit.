"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Lock, CreditCard,
  Copy, Check, RefreshCw,
} from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { MultiSelectField } from "@/components/MultiSelectField";
import { DatePickerField } from "@/components/DatePickerField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { LICENSE_TYPES } from "@/lib/companyOptions";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "@#$!";
  const all = upper + lower + digits + special;
  const rand = (s: string) => s[Math.floor(Math.random() * s.length)];
  const base = [rand(upper), rand(upper), rand(digits), rand(digits), rand(special)];
  for (let i = 0; i < 7; i++) base.push(rand(all));
  return base.sort(() => Math.random() - 0.5).join("");
}

const defaultForm = { firstName: "", lastName: "", email: "", password: "", licenseExpiry: "" };

export default function NewValetPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState(() => ({ ...defaultForm, password: generatePassword() }));
  const [licenseTypes, setLicenseTypes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(form.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRegenerate = () => {
    setForm(p => ({ ...p, password: generatePassword() }));
    setCopied(false);
  };

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
        password: form.password,
        systemRole: "STAFF",
      });
      await apiClient.post("/valets", {
        userId: userRes.id,
        licenseNumber: licenseTypes.join(", "),
        licenseExpiry: new Date(form.licenseExpiry).toISOString(),
        currentStatus: "AVAILABLE",
      });
      router.push("/dashboard/valets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el valet");
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
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={LABEL}>{t("users.password")}</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-input-border bg-input-bg/50">
              <Lock className="w-4 h-4 text-text-muted shrink-0" />
              <span className="flex-1 font-mono tracking-wider text-sm text-text-primary select-all">{form.password}</span>
              <div className="flex items-center gap-0.5 shrink-0">
                <button type="button" onClick={handleCopy} title={t("common.copyPassword")}
                  className="p-1.5 rounded-md text-text-muted hover:text-sky-500 hover:bg-sky-500/10 transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button type="button" onClick={handleRegenerate} title={t("common.regenerate")}
                  className="p-1.5 rounded-md text-text-muted hover:text-sky-500 hover:bg-sky-500/10 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-amber-500/90">{t("common.tempPasswordNote")}</p>
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
    />
  );
}
