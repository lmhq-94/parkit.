"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, Lock, CreditCard, Calendar,
  Activity, ArrowRight, Loader2, Eye, EyeOff, UserCheck,
} from "lucide-react";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { FormPageSkeleton } from "@/components/FormPageSkeleton";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";
const STATUSES = ["AVAILABLE", "BUSY", "AWAY"] as const;

const defaultForm = {
  firstName: "", lastName: "", email: "", password: "",
  licenseNumber: "", licenseExpiry: "", currentStatus: "AVAILABLE",
};

export default function EditValetPage() {
  const { t, tEnum } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState(defaultForm);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    apiClient.get<Record<string, unknown>>(`/valets/${id}`)
      .then(data => {
        if (!data) return;
        const user = data.user as Record<string, unknown> | undefined;
        const uid = (data.userId as string) ?? user?.id ?? "";
        setUserId(uid as string);
        const expiry = data.licenseExpiry
          ? new Date(String(data.licenseExpiry)).toISOString().slice(0, 16)
          : "";
        setForm({
          firstName: String(user?.firstName ?? ""),
          lastName: String(user?.lastName ?? ""),
          email: String(user?.email ?? ""),
          password: "",
          licenseNumber: String(data.licenseNumber ?? ""),
          licenseExpiry: expiry,
          currentStatus: String(data.currentStatus ?? "AVAILABLE"),
        });
      })
      .catch(() => setError(t("common.loadingData")))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.licenseNumber.trim()) return;
    setSubmitting(true); setError(null);
    try {
      const userPayload: Record<string, string> = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
      };
      if (form.password) userPayload.password = form.password;

      await Promise.all([
        apiClient.patch(`/users/${userId}`, userPayload),
        apiClient.patch(`/valets/${id}`, {
          licenseNumber: form.licenseNumber.trim(),
          ...(form.licenseExpiry ? { licenseExpiry: new Date(form.licenseExpiry).toISOString() } : {}),
          currentStatus: form.currentStatus,
        }),
      ]);
      router.push("/dashboard/valets");
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el valet");
    }
    setSubmitting(false);
  };

  const isValid = form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.licenseNumber.trim();

  if (loading) return <FormPageSkeleton />;

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Sección — datos del empleado */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/8 to-transparent flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("valets.sectionEmployee")}</p>
            <p className="text-xs text-text-muted">{t("valets.sectionEmployeeDesc")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">{t("common.requiredBadge")}</span>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("users.firstName")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input value={form.firstName} onChange={set("firstName")} className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("users.lastName")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input value={form.lastName} onChange={set("lastName")} className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("users.email")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input type="email" value={form.email} onChange={set("email")} className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>
                {t("users.password")}
                <span className="ml-2 text-[10px] text-text-muted font-normal">{t("common.passwordHint")}</span>
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password} onChange={set("password")}
                  placeholder="············" autoComplete="new-password"
                  className={IL + " pr-10"}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary transition-colors"
                  aria-label={showPass ? t("common.hidePassword") : t("common.showPassword")}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección — licencia */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-sky-500/8 to-transparent flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("valets.sectionLicense")}</p>
            <p className="text-xs text-text-muted">{t("valets.sectionLicenseDesc")}</p>
          </div>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("valets.licenseNumber")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input value={form.licenseNumber} onChange={set("licenseNumber")} placeholder="B1-000000" className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("valets.licenseExpiry")}</label>
              <div className="relative group">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input type="datetime-local" value={form.licenseExpiry} onChange={set("licenseExpiry")} className={IL} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección — estado */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500/8 to-transparent flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("valets.sectionStatusEdit")}</p>
            <p className="text-xs text-text-muted">{t("valets.sectionStatusEditDesc")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-text-muted/60 bg-input-bg px-2.5 py-1 rounded-full border border-input-border/60">{t("common.optionalBadge")}</span>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <SelectField value={form.currentStatus} onChange={set("currentStatus")} icon={Activity}>
                {STATUSES.map(s => <option key={s} value={s}>{tEnum("valetStatus", s)}</option>)}
              </SelectField>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/valets"
            className="px-5 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors">
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={handleSubmit} disabled={submitting || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />{t("common.saving")}</>
              : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
