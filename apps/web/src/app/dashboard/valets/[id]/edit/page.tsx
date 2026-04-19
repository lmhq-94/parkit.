"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { UserCircle, MailOpen, CreditCard, Activity, ArrowRight, ClipboardText, Car } from "@/lib/premiumIcons";
import { MultiSelectField } from "@/components/MultiSelectField";
import { DatePickerField } from "@/components/DatePickerField";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { PageLoader } from "@/components/PageLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LICENSE_TYPES } from "@/lib/companyOptions";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-all duration-200 ease-out focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary/20 focus:ring-inset placeholder:text-text-muted";
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
  const [footerShadow, setFooterShadow] = useState(false);
  const contentScrollRef = useRef<HTMLDivElement>(null);

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
  }, [id, showError, t]);

  const handleContentScroll = () => {
    const el = contentScrollRef.current;
    if (el) {
      const isAtBottom = el.scrollHeight - el.scrollTop === el.clientHeight;
      setFooterShadow(!isAtBottom);
    }
  };

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
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
  const isValid = form.firstName.trim() && form.lastName.trim() && form.email.trim();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[200px]">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-6 px-4 md:px-10 lg:px-12 w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div
        ref={contentScrollRef}
        onScroll={handleContentScroll}
        className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0 pb-8"
      >
        <div className="md:px-0 lg:px-0 w-full gap-5">
      {/* Sección — datos del empleado */}
      <div className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm premium-section-title">{t("valets.sectionEmployee")}</p>
          </div>
          <p className="text-xs premium-subtitle mt-1">{t("valets.sectionEmployeeDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("users.firstName")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input value={form.firstName} onChange={set("firstName")} className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("users.lastName")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input value={form.lastName} onChange={set("lastName")} className={IL} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("users.email")} <span className="text-red-500">*</span></label>
              <div className="relative group">
                <MailOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
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
            <p className="text-sm premium-section-title">{t("valets.sectionLicense")}</p>
            <p className="text-xs text-text-muted">{t("valets.sectionLicenseDesc")}</p>
          </div>
        </div>
        <div className="p-6 pt-4">
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
            <p className="text-sm premium-section-title">{t("valets.sectionStatusEdit")}</p>
          </div>
          <p className="text-xs premium-subtitle mt-1">{t("valets.sectionStatusEditDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={LABEL}>{t("valets.staffRole")}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, staffRole: "RECEPTIONIST" }))}
                  className={`flex flex-col items-start gap-1.5 rounded-lg border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-company-primary ${
                    form.staffRole === "RECEPTIONIST"
                      ? "border-company-primary bg-company-primary-muted text-company-primary"
                      : "border-input-border bg-input-bg text-text-primary hover:border-company-primary-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ClipboardText className="w-4 h-4" />
                    <span className="font-medium">
                      {tEnum("valetStaffRole", "RECEPTIONIST")}
                    </span>
                  </div>
                  <span className={form.staffRole === "RECEPTIONIST" ? "text-xs text-text-secondary" : "text-xs text-text-muted"}>
                    {t("valets.staffRoleReceptionistDesc")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, staffRole: "DRIVER" }))}
                  className={`flex flex-col items-start gap-1.5 rounded-lg border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-company-primary ${
                    form.staffRole === "DRIVER"
                      ? "border-company-primary bg-company-primary-muted text-company-primary"
                      : "border-input-border bg-input-bg text-text-primary hover:border-company-primary-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    <span className="font-medium">
                      {tEnum("valetStaffRole", "DRIVER")}
                    </span>
                  </div>
                  <span className={form.staffRole === "DRIVER" ? "text-xs text-text-secondary" : "text-xs text-text-muted"}>
                    {t("valets.staffRoleDriverDesc")}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <SelectField value={form.currentStatus} onChange={set("currentStatus")} icon={Activity}>
                {STATUSES.map(s => <option key={s} value={s}>{tEnum("valetStatus", s)}</option>)}
              </SelectField>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>

      <header
        className={`shrink-0 sticky bottom-0 z-10 flex flex-col bg-page border-t border-card-border transition-all duration-200 ${
          footerShadow 
            ? "pb-3 md:pb-5 shadow-[0_-1px_3px_0_rgba(0,0,0,0.06),0_-1px_2px_-1px_rgba(0,0,0,0.06)] dark:shadow-[0_-1px_3px_0_rgba(0,0,0,0.2),0_-1px_2px_-1px_rgba(0,0,0,0.15)]" 
            : "pb-3 md:pb-5"
        }`}
      >
        <div className="flex items-center justify-between gap-4 pt-4 px-4 md:px-8 lg:px-10">
          <p className="text-xs text-text-muted">{t("common.requiredNote")}</p>
          <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/valets"
            className="px-5 py-3 rounded-lg border border-company-secondary-muted text-sm font-medium text-company-secondary hover:bg-company-secondary-subtle hover:text-company-secondary transition-colors">
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={handleSubmit} disabled={submitting || !isDirty || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting
              ? <><LoadingSpinner size="sm" />{t("common.saving")}</>
              : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
      </header>
    </div>
  );
}
