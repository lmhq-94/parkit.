"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleToggle } from "@/components/LocaleToggle";
import { apiClient } from "@/lib/api";
import { ArrowLeft, Menu } from "lucide-react";

const HeaderActionContext = createContext<((node: React.ReactNode) => void) | null>(null);
export function useHeaderAction() {
  const setter = useContext(HeaderActionContext);
  return setter;
}

type PathHeader = {
  title: string;
  titleMyCompany?: string;
  description: string;
  descriptionMyCompany?: string;
  backHref?: string;
  backLabel?: string;
};

const PATH_HEADERS: Record<string, PathHeader> = {
  "/dashboard": { title: "dashboard.title", description: "dashboard.summary" },
  "/dashboard/settings": { title: "settings.title", description: "settings.description" },
  "/dashboard/users": { title: "tables.employees.title", description: "tables.employees.description" },
  "/dashboard/users/new": { title: "users.newUser", description: "users.newUserDescription", backHref: "/dashboard/users", backLabel: "tables.employees.title" },
  "/dashboard/users/[id]/edit": { title: "users.editUser", description: "users.editUserDescription", backHref: "/dashboard/users", backLabel: "tables.employees.title" },
  "/dashboard/valets": { title: "tables.valets.title", description: "tables.valets.description" },
  "/dashboard/valets/new": { title: "valets.newValet", description: "valets.newValetDescription", backHref: "/dashboard/valets", backLabel: "tables.valets.title" },
  "/dashboard/valets/[id]/edit": { title: "valets.editValet", description: "valets.editValetDescription", backHref: "/dashboard/valets", backLabel: "tables.valets.title" },
  "/dashboard/vehicles": { title: "tables.vehicles.title", description: "tables.vehicles.description" },
  "/dashboard/vehicles/new": { title: "vehicles.newVehicle", description: "vehicles.newVehicleDescription", backHref: "/dashboard/vehicles", backLabel: "tables.vehicles.title" },
  "/dashboard/vehicles/[id]/edit": { title: "vehicles.editVehicle", description: "vehicles.editVehicleDescription", backHref: "/dashboard/vehicles", backLabel: "tables.vehicles.title" },
  "/dashboard/parkings": { title: "tables.parkings.title", description: "tables.parkings.description" },
  "/dashboard/parkings/new": { title: "parkings.newParking", description: "parkings.newParkingDescription", backHref: "/dashboard/parkings", backLabel: "tables.parkings.title" },
  "/dashboard/parkings/[id]/edit": { title: "parkings.editParking", description: "parkings.editParkingDescription", backHref: "/dashboard/parkings", backLabel: "tables.parkings.title" },
  "/dashboard/bookings": { title: "tables.bookings.title", description: "tables.bookings.description" },
  "/dashboard/bookings/new": { title: "bookings.newBooking", description: "bookings.newBookingDescription", backHref: "/dashboard/bookings", backLabel: "tables.bookings.title" },
  "/dashboard/bookings/[id]/edit": { title: "bookings.editBooking", description: "bookings.editBookingDescription", backHref: "/dashboard/bookings", backLabel: "tables.bookings.title" },
  "/dashboard/tickets": { title: "tables.tickets.title", description: "tables.tickets.description" },
  "/dashboard/tickets/new": { title: "tickets.newTicket", description: "tickets.newTicketDescription", backHref: "/dashboard/tickets", backLabel: "tables.tickets.title" },
  "/dashboard/tickets/[id]/edit": { title: "tickets.editTicket", description: "tickets.editTicketDescription", backHref: "/dashboard/tickets", backLabel: "tables.tickets.title" },
  "/dashboard/notifications": { title: "tables.notifications.title", description: "tables.notifications.description" },
  "/dashboard/companies": { title: "tables.companies.title", titleMyCompany: "tables.companies.titleMyCompany", description: "tables.companies.description", descriptionMyCompany: "tables.companies.descriptionMyCompany" },
  "/dashboard/companies/new": { title: "companies.newCompany", description: "companies.newCompanyDescription", backHref: "/dashboard/companies", backLabel: "tables.companies.title" },
  "/dashboard/companies/[id]/edit": { title: "companies.editCompany", description: "companies.editCompanyDescription", backHref: "/dashboard/companies", backLabel: "tables.companies.title" },
};

const DEFAULT_HEADER: PathHeader = { title: "dashboard.title", description: "dashboard.summary" };

function getHeaderForPath(pathname: string): PathHeader {
  const exact = PATH_HEADERS[pathname as keyof typeof PATH_HEADERS];
  if (exact) return exact;
  const editMatch = (pathname ?? "").match(/^\/dashboard\/([^/]+)\/[^/]+\/edit$/);
  if (editMatch) {
    const key = `/dashboard/${editMatch[1]}/[id]/edit` as keyof typeof PATH_HEADERS;
    const editHeader = PATH_HEADERS[key];
    if (editHeader) return editHeader as PathHeader;
  }
  return PATH_HEADERS["/dashboard"] ?? DEFAULT_HEADER;
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
  const isNewPage = Boolean(header.backHref);
  const isCompaniesPage = (pathname ?? "") === "/dashboard/companies";
  const useMyCompany = isCompaniesPage && !isSuperAdmin(user);
  const titleKey = useMyCompany && header.titleMyCompany ? header.titleMyCompany : header.title;
  const descriptionKey = useMyCompany && header.descriptionMyCompany ? header.descriptionMyCompany : header.description;
  const descriptionText = tWithCompany(descriptionKey, selectedCompanyName);

  const [headerAction, setHeaderAction] = useState<React.ReactNode>(null);
  useEffect(() => {
    if (isNewPage) setHeaderAction(null);
  }, [isNewPage]);

  const selectedCompanyId = useDashboardStore((s) => s.selectedCompanyId);
  const companyBranding = useDashboardStore((s) => s.companyBranding);
  const setCompanyBranding = useDashboardStore((s) => s.setCompanyBranding);
  const superAdmin = isSuperAdmin(user);

  // Cargar branding de la empresa seleccionada
  useEffect(() => {
    if (!selectedCompanyId) {
      setCompanyBranding(null);
      return;
    }
    const url = superAdmin ? `/companies/${selectedCompanyId}` : "/companies/me";
    apiClient
      .get<{ brandingConfig?: { bannerImageUrl?: string; logoImageUrl?: string; primaryColor?: string; secondaryColor?: string } | null }>(url)
      .then((data) => {
        const bc = data?.brandingConfig && typeof data.brandingConfig === "object" ? data.brandingConfig : null;
        setCompanyBranding(bc ? { bannerImageUrl: bc.bannerImageUrl ?? null, logoImageUrl: bc.logoImageUrl ?? null, primaryColor: bc.primaryColor ?? null, secondaryColor: bc.secondaryColor ?? null } : null);
      })
      .catch(() => setCompanyBranding(null));
  }, [selectedCompanyId, superAdmin, setCompanyBranding]);

  // Aplicar colores de la empresa como variables CSS
  useEffect(() => {
    if (typeof document === "undefined") return;
    const primary = companyBranding?.primaryColor?.trim();
    const secondary = companyBranding?.secondaryColor?.trim();
    document.documentElement.style.setProperty("--company-primary", primary && /^#[0-9A-Fa-f]{3,6}$/.test(primary) ? primary : "");
    document.documentElement.style.setProperty("--company-secondary", secondary && /^#[0-9A-Fa-f]{3,6}$/.test(secondary) ? secondary : "");
  }, [companyBranding?.primaryColor, companyBranding?.secondaryColor]);

  return (
    <ProtectedRoute>
      <HeaderActionContext.Provider value={setHeaderAction}>
        <div className="flex min-h-screen bg-page">
          <DashboardSidebar />
          <main className="flex-1 flex flex-col min-h-0 min-w-0">
            <header className="shrink-0 flex flex-col bg-card/50 backdrop-blur-sm">
              {companyBranding?.bannerImageUrl && (
                <div className="w-full h-20 md:h-24 overflow-hidden bg-input-bg">
                  <img src={companyBranding.bannerImageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-4 px-4 md:pl-12 md:pr-10 lg:pr-12 pt-5 md:pt-8 pb-0">
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
                {isNewPage && header.backHref ? (
                  <>
                    <Link
                      href={header.backHref}
                      className="inline-flex items-center gap-2 text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary hover:text-text-secondary tracking-tight transition-colors group"
                    >
                      <ArrowLeft className="shrink-0 w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform duration-150" />
                      <span className="truncate">{t(header.backLabel!)}</span>
                    </Link>
                    <p className="text-text-secondary text-sm md:text-base mt-1 md:mt-2 font-medium max-w-2xl truncate opacity-90 hidden sm:block">
                      {t(titleKey)}
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary tracking-tight truncate drop-shadow-sm">
                      {t(titleKey)}
                    </h1>
                    <p className="text-text-secondary text-sm md:text-base mt-1 md:mt-2 font-medium max-w-2xl truncate opacity-90 hidden sm:block">
                      {descriptionText}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-auto">
              {headerAction && (
                <>
                  <div className="flex items-center">
                    {headerAction}
                  </div>
                  <hr className="h-6 w-px border-0 bg-input-border shrink-0 self-center" role="separator" aria-orientation="vertical" />
                </>
              )}
              <ThemeToggle />
              <LocaleToggle />
            </div>
              </div>
          </header>
          <div className="flex-1 flex flex-col overflow-auto min-h-0">{children}</div>
        </main>
      </div>
      </HeaderActionContext.Provider>
    </ProtectedRoute>
  );
}
