"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Pencil, Plus } from "lucide-react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import { apiClient } from "@/lib/api";

interface Company {
  id: string;
  legalName?: string;
  commercialName?: string;
  legalAddress?: string;
  taxId?: string;
  countryCode?: string;
  currency?: string;
  timezone?: string;
  billingEmail?: string;
  contactPhone?: string;
  status?: string;
  name?: string;
  email?: string;
}

function CompanyDetailModal({ company, onClose, canEdit, t, tEnum }: {
  company: Company;
  onClose: () => void;
  canEdit: boolean;
  t: (key: string) => string;
  tEnum: (ns: string, val?: string | null) => string;
}) {
  const displayName = company.name ?? company.commercialName ?? company.legalName ?? "—";
  const isActive = company.status === "ACTIVE";

  useEffect(() => {
    // Cierra cualquier dropdown abierto de AG Grid al montar el modal
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const F = ({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) => {
    if (!value) return null;
    return (
      <div className={wide ? "col-span-2" : ""}>
        <p className="text-xs text-text-muted mb-1.5">{label}</p>
        <p className="text-sm font-medium text-text-primary leading-relaxed">{value}</p>
      </div>
    );
  };

  const Sep = () => <div className="col-span-3 h-px bg-card-border/30" />;
  const Label = ({ text }: { text: string }) => (
    <div className="col-span-3 -mb-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{text}</p>
    </div>
  );

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-3xl bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 px-8 py-5 bg-card border-b border-card-border">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-text-primary truncate leading-tight">{displayName}</h2>
            {company.legalName && displayName !== company.legalName && (
              <p className="text-xs text-text-muted truncate">{company.legalName}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {company.status && (
              <span className={[
                "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border",
                isActive
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-amber-400 bg-amber-500/10 border-amber-500/20",
              ].join(" ")}>
                <span className={["w-1.5 h-1.5 rounded-full", isActive ? "bg-emerald-400" : "bg-amber-400"].join(" ")} />
                {tEnum("companyStatus", company.status)}
              </span>
            )}
            {canEdit && (
              <Link
                href={`/dashboard/companies/${company.id}/edit`}
                onClick={onClose}
                className="p-2 rounded-lg text-text-muted hover:text-sky-500 hover:bg-sky-500/10 transition-colors"
                title={t("common.edit")}
                aria-label={t("common.edit")}
              >
                <Pencil className="w-4 h-4" />
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              title={t("common.cancel")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div className="px-8 py-7">
          <dl className="grid grid-cols-3 gap-x-8 gap-y-6">

            <Label text={t("companies.sectionMain")} />
            <F label={t("companies.legalName")}      value={company.legalName} />
            <F label={t("companies.commercialName")} value={company.commercialName} />
            <F label={t("companies.taxId")}          value={company.taxId} />

            <Sep />

            <Label text={t("companies.sectionContact")} />
            <F label={t("companies.billingEmail")}   value={company.billingEmail ?? company.email} />
            <F label={t("companies.contactPhone")}   value={company.contactPhone} />
            <F label={t("companies.legalAddress")}   value={company.legalAddress} />

            {(company.countryCode || company.currency || company.timezone) && (
              <>
                <Sep />
                <Label text={t("companies.sectionRegional")} />
                <F label={t("companies.countryCode")} value={company.countryCode} />
                <F label={t("companies.currency")}    value={company.currency} />
                <F label={t("companies.timezone")}    value={company.timezone} />
              </>
            )}
          </dl>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <div className="flex items-center justify-end px-8 py-4 bg-card border-t border-card-border">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default function CompaniesPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const bumpCompanies = useDashboardStore((s) => s.bumpCompanies);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();
  const [viewCompany, setViewCompany] = useState<Company | null>(null);

  const fetchData = useMemo(
    () => async (_userId: string): Promise<Company[]> => {
      const u = useAuthStore.getState().user;
      if (isSuperAdmin(u)) {
        const data = await apiClient.get<Company[]>("/companies");
        return Array.isArray(data) ? data : [];
      }
      const data = await apiClient.get<Company>("/companies/me");
      return data ? [data] : [];
    },
    []
  );

  const columns = useMemo(
    () => [
      {
        header: t("tables.companies.name"),
        render: (c: Company) =>
          c.name ?? c.commercialName ?? c.legalName ?? "—",
        field: "commercialName" as const,
        editable: true,
      },
      {
        header: t("tables.companies.email"),
        render: (c: Company) => c.email ?? c.billingEmail ?? "—",
        field: "billingEmail" as const,
        editable: true,
        linkType: "email",
      },
      {
        header: t("companies.contactPhone"),
        render: (c: Company) => c.contactPhone ?? "—",
        linkType: "phone",
      },
      {
        header: t("tables.companies.status"),
        render: (c: Company) => tEnum("companyStatus", c.status),
        statusBadge: "company",
        statusField: "status",
      },
    ],
    [t, tEnum]
  );

  const title = superAdmin
    ? t("tables.companies.title")
    : t("tables.companies.titleMyCompany");
  const description = superAdmin
    ? t("tables.companies.description")
    : tWithCompany("tables.companies.descriptionMyCompany", selectedCompanyName);

  const onUpdate = useCallback(
    async (row: Company) => {
      if (!row.id) return;
      const payload: {
        legalName?: string;
        commercialName?: string;
        billingEmail?: string;
        contactPhone?: string;
        legalAddress?: string;
      } = {};
      if (row.legalName !== undefined) payload.legalName = String(row.legalName).trim();
      if (row.commercialName !== undefined) payload.commercialName = String(row.commercialName).trim();
      if (row.billingEmail !== undefined) payload.billingEmail = String(row.billingEmail).trim() || undefined;
      if (row.contactPhone !== undefined) payload.contactPhone = String(row.contactPhone).trim();
      if (row.legalAddress !== undefined) payload.legalAddress = String(row.legalAddress).trim();
      if (Object.keys(payload).length === 0) return;
      if (superAdmin) {
        await apiClient.patch(`/companies/${row.id}`, payload);
      } else {
        await apiClient.patch("/companies/me", payload);
      }
      bumpCompanies();
    },
    [superAdmin, bumpCompanies]
  );

  const onDelete = useCallback(async (row: Company) => {
    if (!row.id) return;
    await apiClient.delete(`/companies/${row.id}`);
    bumpCompanies();
  }, [bumpCompanies]);

  return (
    <>
      <DashboardDataTablePage<Company>
        title={title}
        description={description}
        endpoint="/companies"
        fetchData={fetchData}
        columns={columns}
        emptyMessage={t("tables.companies.empty")}
        onView={(row) => {
          document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          setTimeout(() => setViewCompany(row), 50);
        }}
        onEdit={superAdmin ? (row) => router.push(`/dashboard/companies/${row.id}/edit`) : undefined}
        onUpdate={onUpdate}
        onDelete={superAdmin ? onDelete : undefined}
        getConfirmDeleteMessage={superAdmin ? () => t("tables.companies.confirmDelete") : undefined}
        headerAction={
          superAdmin ? (
            <Link
              href="/dashboard/companies/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors shadow-sm shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" strokeWidth={2.25} />
              {t("common.add")}
            </Link>
          ) : undefined
        }
      />
      {viewCompany && (
        <CompanyDetailModal
          company={viewCompany}
          onClose={() => setViewCompany(null)}
          canEdit={superAdmin}
          t={t}
          tEnum={tEnum}
        />
      )}
    </>
  );
}
