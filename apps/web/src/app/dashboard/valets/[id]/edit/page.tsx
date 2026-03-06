"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { UserCheck, CreditCard, Calendar, Activity, ChevronDown, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { FormPageSkeleton } from "@/components/FormPageSkeleton";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-text-muted";
const SL = "w-full pl-10 pr-9 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 appearance-none";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";
const STATUSES = ["AVAILABLE", "BUSY", "AWAY"] as const;

type UserOption = { id: string; firstName?: string; lastName?: string; email?: string };

const defaultForm = { userId: "", licenseNumber: "", licenseExpiry: "", currentStatus: "AVAILABLE" };

export default function EditValetPage() {
  const { t, tEnum } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState(defaultForm);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get<Record<string, unknown>>(`/valets/${id}`),
      apiClient.get<UserOption[]>("/users"),
    ]).then(([valetData, usersData]) => {
      if (valetData) {
        const expiry = valetData.licenseExpiry
          ? new Date(String(valetData.licenseExpiry)).toISOString().slice(0, 16)
          : "";
        const userId = (valetData.userId as string) ?? (valetData.user as { id?: string } | undefined)?.id ?? "";
        setForm({
          userId,
          licenseNumber: String(valetData.licenseNumber ?? ""),
          licenseExpiry: expiry,
          currentStatus: String(valetData.currentStatus ?? "AVAILABLE"),
        });
      }
      setUsers(Array.isArray(usersData) ? usersData : []);
    }).catch(() => {
      setError(t("common.loadingData"));
    }).finally(() => {
      setLoading(false);
      setLoadingUsers(false);
    });
  }, [id, t]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.licenseNumber.trim()) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.patch(`/valets/${id}`, {
        licenseNumber: form.licenseNumber.trim(),
        ...(form.licenseExpiry ? { licenseExpiry: new Date(form.licenseExpiry).toISOString() } : {}),
        currentStatus: form.currentStatus,
      });
      router.push("/dashboard/valets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el valet");
    } finally { setSubmitting(false); }
  };

  const isValid = form.licenseNumber.trim();

  if (loading) return <FormPageSkeleton />;

  const selectedUser = users.find(u => u.id === form.userId);
  const userLabel = selectedUser
    ? `${selectedUser.firstName ?? ""} ${selectedUser.lastName ?? ""}`.trim() || selectedUser.email || form.userId
    : form.userId;

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/8 to-transparent flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <UserCheck className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("valets.sectionMain")}</p>
            <p className="text-xs text-text-muted">{t("valets.sectionMainDesc")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">{t("common.requiredBadge")}</span>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {form.userId && (
              <div className="sm:col-span-2 lg:col-span-3">
                <label className={LABEL}>{t("valets.selectUser")}</label>
                {loadingUsers ? (
                  <div className="h-[46px] rounded-lg bg-input-bg border border-input-border animate-pulse" />
                ) : (
                  <div className="relative group">
                    <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <select value={form.userId} onChange={set("userId")} className={SL}>
                      <option value={form.userId}>{userLabel}</option>
                      {users.filter(u => u.id !== form.userId).map(u => (
                        <option key={u.id} value={u.id}>
                          {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || u.id}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50 pointer-events-none" />
                  </div>
                )}
              </div>
            )}
            <div>
              <label className={LABEL}>{t("valets.licenseNumber")} <span className="text-sky-500">*</span></label>
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

      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-sky-500/8 to-transparent flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Activity className="w-4.5 h-4.5 text-sky-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("valets.sectionStatus")}</p>
            <p className="text-xs text-text-muted">{t("valets.sectionStatusDesc")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-text-muted/60 bg-input-bg px-2.5 py-1 rounded-full border border-input-border/60">{t("common.optionalBadge")}</span>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("valets.currentStatus")}</label>
              <div className="relative group">
                <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <select value={form.currentStatus} onChange={set("currentStatus")} className={SL}>
                  {STATUSES.map(s => <option key={s} value={s}>{tEnum("valetStatus", s)}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/valets"
            className="px-5 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors">
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={handleSubmit} disabled={submitting || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("common.saving")}</> : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
