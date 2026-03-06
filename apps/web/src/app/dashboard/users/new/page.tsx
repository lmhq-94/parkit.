"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, UserCircle, Mail, Lock, Phone, Clock, Shield, ArrowRight, Loader2, Copy, Check, RefreshCw } from "lucide-react";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";
const ROLES = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"] as const;

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

const defaultForm = {
  firstName: "", lastName: "", email: "",
  password: "", systemRole: "CUSTOMER", phone: "",
  timezone: "America/Costa_Rica",
};

export default function NewUserPage() {
  const { t, tEnum } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState(() => ({ ...defaultForm, password: generatePassword() }));
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
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.post("/users", {
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        email: form.email.trim(), password: form.password,
        systemRole: form.systemRole,
        phone: form.phone.trim() || undefined,
        timezone: form.timezone.trim() || undefined,
      });
      router.push("/dashboard/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el empleado");
    } finally { setSubmitting(false); }
  };

  const isValid = form.firstName.trim() && form.lastName.trim() && form.email.trim();

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Sección — identidad y acceso */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-violet-500/8 to-transparent flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("users.sectionMain")}</p>
            <p className="text-xs text-text-muted">{t("users.sectionMainDesc")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">{t("common.requiredBadge")}</span>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("users.firstName")} <span className="text-sky-500">*</span></label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input value={form.firstName} onChange={set("firstName")} placeholder="Luis" className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("users.lastName")} <span className="text-sky-500">*</span></label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input value={form.lastName} onChange={set("lastName")} placeholder="Herrera" className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("users.email")} <span className="text-sky-500">*</span></label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input type="email" value={form.email} onChange={set("email")} placeholder="nombre@empresa.com" className={IL} />
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
            <div>
              <label className={LABEL}>{t("users.role")}</label>
              <SelectField value={form.systemRole} onChange={set("systemRole")} icon={Shield}>
                {ROLES.map(r => <option key={r} value={r}>{tEnum("systemRole", r)}</option>)}
              </SelectField>
            </div>
          </div>
        </div>
      </div>

      {/* Sección — contacto y preferencias */}
      <div className="bg-card/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500/8 to-transparent flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("users.sectionContact")}</p>
            <p className="text-xs text-text-muted">{t("users.sectionContactDesc")}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold text-text-muted/60 bg-input-bg px-2.5 py-1 rounded-full border border-input-border/60">{t("common.optionalBadge")}</span>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("users.phone")}</label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input value={form.phone} onChange={set("phone")} placeholder="+506 0000-0000" className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("users.timezone")}</label>
              <div className="relative group">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                <input value={form.timezone} onChange={set("timezone")} placeholder="America/Costa_Rica" className={IL} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/users"
            className="px-5 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors">
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={handleSubmit} disabled={submitting || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("users.creating")}</> : <>{t("users.createUser")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
