"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Clock, Shield, ArrowRight, Loader2 } from "lucide-react";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { FormPageSkeleton } from "@/components/FormPageSkeleton";
import { TIMEZONES } from "@/lib/companyOptions";
import { formatPhoneWithCountryCode } from "@/lib/inputMasks";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";
const ROLES = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"] as const;

const defaultForm = {
  firstName: "", lastName: "", email: "",
  systemRole: "CUSTOMER", phone: "",
  timezone: "",
};

export default function EditUserPage() {
  const { t, tEnum } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.get<Record<string, unknown>>(`/users/${id}`);
        if (data) {
          setForm({
            firstName: String(data.firstName ?? ""),
            lastName: String(data.lastName ?? ""),
            email: String(data.email ?? ""),
            systemRole: String(data.systemRole ?? "STAFF"),
            phone: formatPhoneWithCountryCode(String(data.phone ?? ""), "CR"),
            timezone: String(data.timezone ?? ""),
          });
        }
      } catch {
        setError(t("common.loadingData"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.patch(`/users/${id}`, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        systemRole: form.systemRole,
        phone: form.phone.replace(/\D/g, "").length > 0 ? form.phone.replace(/\D/g, "") : undefined,
        timezone: form.timezone.trim() || undefined,
      });
      router.push("/dashboard/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el empleado");
    } finally { setSubmitting(false); }
  };

  const isValid = form.firstName.trim() && form.lastName.trim() && form.email.trim();

  if (loading) return <FormPageSkeleton />;

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-violet-500/8 to-transparent">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("users.sectionMain")}</p>
            <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">{t("common.requiredBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("users.sectionMainDesc")}</p>
        </div>
        <div className="p-6 pt-4">
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
        </div>
      </div>

      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500/8 to-transparent">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("users.sectionContact")}</p>
            <span className="text-[10px] font-semibold text-text-muted/60 bg-input-bg px-2.5 py-1 rounded-full border border-input-border/60">{t("common.optionalBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("users.sectionContactDesc")}</p>
        </div>
        <div className="p-6 pt-4">
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
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/users"
            className="px-5 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors">
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={handleSubmit} disabled={submitting || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("common.saving")}</> : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
