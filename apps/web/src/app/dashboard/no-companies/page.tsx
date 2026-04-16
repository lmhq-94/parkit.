"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus } from "@/lib/premiumIcons";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { getStoredUser, isSuperAdmin } from "@/lib/auth";

export default function NoCompaniesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = getStoredUser();
  const superAdmin = isSuperAdmin(user);

  // Only SUPER_ADMIN can view this page. ADMIN/STAFF belong to a company -> overview.
  useEffect(() => {
    if (user && !superAdmin) {
      router.replace("/dashboard");
    }
  }, [user, superAdmin, router]);

  if (user && !superAdmin) {
    return null;
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-company-primary/5 via-transparent to-company-primary/3 pointer-events-none" />
      
      {/* Decorative blurred circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-company-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-company-primary/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative max-w-lg w-full text-center">
        {/* Premium icon with layered glow effects */}
        <div className="mx-auto mb-8 relative">
          {/* Outer animated glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-company-primary/30 via-company-primary/10 to-transparent rounded-full blur-3xl animate-pulse" />
          </div>

          {/* Secondary glow ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-company-primary/20 to-company-primary/5 rounded-full blur-2xl" />
          </div>

          {/* Large icon without container */}
          <div className="relative flex items-center justify-center">
            <Sparkles
              className="h-14 w-14 text-company-primary"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Premium typography with refined hierarchy */}
        <div className="space-y-4 mb-10">
          <h1 className="text-[1.75rem] md:text-[2rem] premium-title premium-title-glow">
            {t("companies.noCompaniesTitle")}
          </h1>

          <p className="premium-subtitle text-base leading-relaxed max-w-sm mx-auto">
            {t("companies.noCompaniesPositiveDescription")}
          </p>
        </div>
        
        {/* Premium CTA button with enhanced styling */}
        <div className="flex justify-center mb-8">
          <Link
            href="/dashboard/companies/new?first=1"
            className="group inline-flex items-center gap-2 justify-center rounded-lg bg-company-primary px-6 py-3 text-sm font-medium text-white hover:bg-company-primary/90 focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page transition-all"
          >
            <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
            <span>{t("companies.createFirstCompany")}</span>
          </Link>
        </div>

      </div>
      
      {/* Legal links - absolute bottom */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-3 text-[11px] text-text-muted/40">
        <Link href="/privacy" className="hover:text-text-muted/70 transition-colors">
          {t("footer.privacyPolicy")}
        </Link>
        <span className="w-0.5 h-0.5 rounded-full bg-text-muted/30" />
        <Link href="/terms" className="hover:text-text-muted/70 transition-colors">
          {t("footer.terms")}
        </Link>
      </div>
    </div>
  );
}

