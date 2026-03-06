"use client";

import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleToggle } from "@/components/LocaleToggle";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import { Menu } from "lucide-react";

const PATH_HEADERS: Record<string, { title: string; titleMyCompany?: string; description: string; descriptionMyCompany?: string }> = {
  "/dashboard": { title: "dashboard.title", description: "dashboard.summary" },
  "/dashboard/settings": { title: "settings.title", description: "settings.description" },
  "/dashboard/users": { title: "tables.employees.title", description: "tables.employees.description" },
  "/dashboard/valets": { title: "tables.valets.title", description: "tables.valets.description" },
  "/dashboard/vehicles": { title: "tables.vehicles.title", description: "tables.vehicles.description" },
  "/dashboard/parkings": { title: "tables.parkings.title", description: "tables.parkings.description" },
  "/dashboard/bookings": { title: "tables.bookings.title", description: "tables.bookings.description" },
  "/dashboard/tickets": { title: "tables.tickets.title", description: "tables.tickets.description" },
  "/dashboard/notifications": { title: "tables.notifications.title", description: "tables.notifications.description" },
  "/dashboard/companies": { title: "tables.companies.title", titleMyCompany: "tables.companies.titleMyCompany", description: "tables.companies.description", descriptionMyCompany: "tables.companies.descriptionMyCompany" },
};

function getHeaderForPath(pathname: string) {
  return PATH_HEADERS[pathname] ?? PATH_HEADERS["/dashboard"];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t, tWithCompany } = useTranslation();
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const toggleSidebar = useDashboardStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const header = getHeaderForPath(pathname ?? "");
  const isCompaniesPage = (pathname ?? "") === "/dashboard/companies";
  const useMyCompany = isCompaniesPage && !isSuperAdmin(user);
  const titleKey = useMyCompany && header.titleMyCompany ? header.titleMyCompany : header.title;
  const descriptionKey = useMyCompany && header.descriptionMyCompany ? header.descriptionMyCompany : header.description;
  const descriptionText = tWithCompany(descriptionKey, selectedCompanyName);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-page">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col min-h-0 min-w-0">
          <header className="shrink-0 flex flex-wrap items-center justify-between gap-4 px-4 md:pl-12 md:pr-6 pt-5 md:pt-8 pb-0 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 min-w-0">
              {/* Hamburger: solo móvil */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-input-bg transition-colors shrink-0"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary tracking-tight truncate drop-shadow-sm">
                  {t(titleKey)}
                </h1>
                <p className="text-text-secondary text-sm md:text-base mt-1 md:mt-2 font-medium max-w-2xl truncate opacity-90 hidden sm:block">
                  {descriptionText}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <LocaleToggle />
            </div>
          </header>
          <div className="flex-1 flex flex-col overflow-auto min-h-0">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
