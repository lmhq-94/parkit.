"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, CreditCard, Activity, ArrowRight, Briefcase } from "lucide-react";
import { MultiSelectField } from "@/components/MultiSelectField";
import { DatePickerField } from "@/components/DatePickerField";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { PageLoader } from "@/components/PageLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LICENSE_TYPES } from "@/lib/companyOptions";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";
const STATUSES = ["AVAILABLE", "BUSY", "AWAY"] as const;
const STAFF_ROLES = ["RECEPTIONIST", "DRIVER"] as const;

const defaultForm = {
  firstName: "", lastName: "", email: "",
  licenseExpiry: "", currentStatus: "AVAILABLE",
  staffRole: "RECEPTIONIST" as (typeof STAFF_ROLES)[number],
};

export default function EditValetPage() {
  const { t, tEnum } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState(defaultForm);
  const [initialForm, setInitialForm] = useState(defaultForm);
  const [licenseTypes, setLicenseTypes] = useState<string[]>([]);
  const [initialLicenseTypes, setInitialLicenseTypes] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<Record<string, unknown>>(`/valets/${id}`)
      .then(data => {
        if (!data) return;
        const user = data.user as Record<string, unknown> | undefined;
        const uid = (data.userId as string) ?? user?.id ?? "";
        setUserId(uid as string);
        const expiryRaw = data.licenseExpiry
          ? new Date(String(data.licenseExpiry)).toISOString().slice(0, 10)
          : "";
        const storedLicense = String(data.licenseNumber ?? "");
        const parsedTypes = storedLicense
          ? storedLicense.split(",").map(s => s.trim()).filter(Boolean)
          : [];
        setLicenseTypes(parsedTypes);
        setInitialLicenseTypes(parsedTypes);
        const sr = data.staffRole as string | null | undefined;
        const staffRole: (typeof STAFF_ROLES)[number] =
          sr === "RECEPTIONIST" || sr === "DRIVER" ? sr : "RECEPTIONIST";
        const loaded = {
          firstName: String(user?.firstName ?? ""),
          lastName: String(user?.lastName ?? ""),
          email: String(user?.email ?? ""),
          licenseExpiry: expiryRaw,
          currentStatus: String(data.currentStatus ?? "AVAILABLE"),
          staffRole,
        };
        setForm(loaded);
        setInitialForm(loaded);
      })
      .catch(() => { setError(t("common.loadingData")); showError(t("common.loadError")); })
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || licenseTypes.length === 0) return;
    setSubmitting(true); setError(null);
    try {
      await Promise.all([
        apiClient.patch(`/users/${userId}`, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
        }),
        apiClient.patch(`/valets/${id}`, {
          licenseNumber: licenseTypes.join(", "),
          ...(form.licenseExpiry ? { licenseExpiry: new Date(form.licenseExpiry).toISOString() } : {}),
          currentStatus: form.currentStatus,
          staffRole: form.staffRole,
        }),
      ]);
      showSuccess(t("common.saveSuccessShort"));
      router.push("/dashboard/valets");
      return;
    } catch (err) {
      const msg = getTranslatedApiErrorMessage(err, t) || t("apiErrors.requestFailed");
      setError(msg);
      showError(msg);
    }
    setSubmitting(false);
  };

  const isDirty = useMemo(
    () =>
      JSON.stringify(form) !== JSON.stringify(initialForm) ||
      JSON.stringify([...licenseTypes].sort()) !== JSON.stringify([...initialLicenseTypes].sort()),
    [form, initialForm, licenseTypes, initialLicenseTypes]
  );
  const isValid = form.firstName.trim() && form.lastName.trim() && form.email.trim() && licenseTypes.length > 0;

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

      {/* Sección — datos del empleado */}
      <div className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("valets.sectionEmployee")}</p>
            <span className="text-[11px] font-medium text-red-500">{t("common.requiredBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("valets.sectionEmployeeDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("users.firstName")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input value={form.firstName} onChange={set("firstName")} className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("users.lastName")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input value={form.lastName} onChange={set("lastName")} className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("users.email")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input type="email" value={form.email} onChange={set("email")} className={IL} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección — licencia */}
      <div className="overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("valets.sectionLicense")}</p>
            <p className="text-xs text-text-muted">{t("valets.sectionLicenseDesc")}</p>
          </div>
        </div>
        <div className="p-6 pt-4">
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
              <label className={LABEL}>{t("valets.licenseExpiry")}</label>
              <DatePickerField
                value={form.licenseExpiry}
                onChange={v => setForm(p => ({ ...p, licenseExpiry: v }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección — estado */}
      <div className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("valets.sectionStatusEdit")}</p>
            <span className="text-[11px] font-medium text-text-muted">{t("common.optionalBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("valets.sectionStatusEditDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("valets.staffRole")}</label>
              <SelectField value={form.staffRole} onChange={set("staffRole")} icon={Briefcase}>
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>{tEnum("valetStaffRole", r)}</option>
                ))}
              </SelectField>
            </div>
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
            className="px-5 py-3 rounded-lg border border-company-secondary-muted text-sm font-medium text-company-secondary hover:bg-company-secondary-subtle hover:text-company-secondary transition-colors">
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={handleSubmit} disabled={submitting || !isDirty || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting
              ? <><LoadingSpinner size="sm" />{t("common.saving")}</>
              : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
