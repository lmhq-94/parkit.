"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderX } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { getStoredUser, isSuperAdmin } from "@/lib/auth";

export default function NoCompaniesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = getStoredUser();
  const superAdmin = isSuperAdmin(user);

  // Solo SUPER_ADMIN puede ver esta página. ADMIN/STAFF pertenecen a una empresa → overview.
  useEffect(() => {
    if (user && !superAdmin) {
      router.replace("/dashboard");
    }
  }, [user, superAdmin, router]);

  if (user && !superAdmin) {
    return null;
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="max-w-md w-full rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-company-primary">
          <FolderX className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold text-text-primary mb-2">
          {t("companies.noCompanies")}
        </h1>
        <p className="text-sm text-text-muted mb-6">
          {t("settings.description")}
        </p>
        <div className="flex justify-center">
          <Link
            href="/dashboard/companies/new?first=1"
            className="inline-flex items-center justify-center rounded-xl bg-company-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page"
          >
            {t("companies.createCompany")}
          </Link>
        </div>
      </div>
    </div>
  );
}

