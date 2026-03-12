"use client";

import React, { Suspense, createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import type { CompanyBranding } from "@/lib/store";
import { getAvatarColor, getFullName, getInitials, isSuperAdmin } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleToggle } from "@/components/LocaleToggle";
import { apiClient } from "@/lib/api";
import { ArrowLeft, ChevronDown, Menu } from "lucide-react";

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
  "/dashboard/no-companies": { title: "companies.title", description: "companies.newCompanyDescription" },
  "/dashboard/profile": { title: "profile.title", description: "profile.description" },
  "/dashboard/super-admins/new": { title: "superAdmins.newSuperAdmin", description: "superAdmins.newSuperAdminDescription", backHref: "/dashboard/profile", backLabel: "profile.title" },
  "/dashboard/settings": { title: "settings.title", description: "settings.description" },
  "/dashboard/users": { title: "tables.employees.title", description: "tables.employees.description" },
  "/dashboard/users/new": { title: "users.newUser", description: "users.newUserDescription", backHref: "/dashboard/users", backLabel: "tables.employees.title" },
  "/dashboard/users/[id]/edit": { title: "tables.employees.title", description: "users.editUserDescription", backHref: "/dashboard/users", backLabel: "tables.employees.title" },
  "/dashboard/valets": { title: "tables.valets.title", description: "tables.valets.description" },
  "/dashboard/valets/new": { title: "valets.newValet", description: "valets.newValetDescription", backHref: "/dashboard/valets", backLabel: "tables.valets.title" },
  "/dashboard/valets/[id]/edit": { title: "tables.valets.title", description: "valets.editValetDescription", backHref: "/dashboard/valets", backLabel: "tables.valets.title" },
  "/dashboard/vehicles": { title: "tables.vehicles.title", description: "tables.vehicles.description" },
  "/dashboard/vehicles/new": { title: "vehicles.newVehicle", description: "vehicles.newVehicleDescription", backHref: "/dashboard/vehicles", backLabel: "tables.vehicles.title" },
  "/dashboard/vehicles/[id]/edit": { title: "tables.vehicles.title", description: "vehicles.editVehicleDescription", backHref: "/dashboard/vehicles", backLabel: "tables.vehicles.title" },
  "/dashboard/parkings": { title: "tables.parkings.title", description: "tables.parkings.description" },
  "/dashboard/parkings/new": { title: "parkings.newParking", description: "parkings.newParkingDescription", backHref: "/dashboard/parkings", backLabel: "tables.parkings.title" },
  "/dashboard/parkings/[id]/edit": { title: "tables.parkings.title", description: "parkings.editParkingDescription", backHref: "/dashboard/parkings", backLabel: "tables.parkings.title" },
  "/dashboard/bookings": { title: "tables.bookings.title", description: "tables.bookings.description" },
  "/dashboard/bookings/new": { title: "bookings.newBooking", description: "bookings.newBookingDescription", backHref: "/dashboard/bookings", backLabel: "tables.bookings.title" },
  "/dashboard/bookings/[id]/edit": { title: "tables.bookings.title", description: "bookings.editBookingDescription", backHref: "/dashboard/bookings", backLabel: "tables.bookings.title" },
  "/dashboard/tickets": { title: "tables.tickets.title", description: "tables.tickets.description" },
  "/dashboard/tickets/new": { title: "tickets.newTicket", description: "tickets.newTicketDescription", backHref: "/dashboard/tickets", backLabel: "tables.tickets.title" },
  "/dashboard/tickets/[id]/edit": { title: "tables.tickets.title", description: "tickets.editTicketDescription", backHref: "/dashboard/tickets", backLabel: "tables.tickets.title" },
  "/dashboard/notifications": { title: "tables.notifications.title", description: "tables.notifications.description" },
  "/dashboard/customers": { title: "tables.customers.title", description: "tables.customers.description" },
  "/dashboard/companies": { title: "tables.companies.title", titleMyCompany: "tables.companies.titleMyCompany", description: "tables.companies.description", descriptionMyCompany: "tables.companies.descriptionMyCompany" },
  "/dashboard/companies/new": { title: "companies.newCompany", description: "companies.newCompanyDescription", backHref: "/dashboard/companies", backLabel: "tables.companies.title" },
  "/dashboard/companies/[id]/edit": { title: "tables.companies.title", description: "companies.editCompanyDescription", backHref: "/dashboard/companies", backLabel: "tables.companies.title" },
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

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, tWithCompany } = useTranslation();
  const selectedCompanyName = useDashboardStore((s: any) => s.selectedCompanyName);
  const toggleSidebar = useDashboardStore((s: any) => s.toggleSidebar);
  const user = useAuthStore((s: any) => s.user);
  const logout = useAuthStore((s: any) => s.logout);
  const header = getHeaderForPath(pathname ?? "");
  const isFirstCompanyFlow =
    (pathname ?? "") === "/dashboard/companies/new" && searchParams?.get("first") === "1";
  const isNewPage = Boolean(header.backHref) && !isFirstCompanyFlow;
  const isCompaniesPage = (pathname ?? "") === "/dashboard/companies";
  const useMyCompany = isCompaniesPage && !isSuperAdmin(user);
  let titleKey = useMyCompany && header.titleMyCompany ? header.titleMyCompany : header.title;
  let descriptionKey = useMyCompany && header.descriptionMyCompany ? header.descriptionMyCompany : header.description;
  let backHref = header.backHref;
  let backLabelKey = header.backLabel;

  // Personalizar título y descripción de creación de usuarios según rol (ADMIN vs CUSTOMER).
  if ((pathname ?? "") === "/dashboard/users/new") {
    const roleParam = (searchParams?.get("role") || "").toUpperCase();
    if (roleParam === "ADMIN") {
      titleKey = "users.newAdmin";
      descriptionKey = "users.newAdminDescription";
    } else if (roleParam === "CUSTOMER") {
      titleKey = "users.newCustomer";
      descriptionKey = "users.newCustomerDescription";
      backHref = "/dashboard/customers";
      backLabelKey = "tables.customers.title";
    }
  }
  const descriptionText = tWithCompany(descriptionKey, selectedCompanyName);

  const [headerAction, setHeaderAction] = useState<React.ReactNode>(null);
  const [headerShadow, setHeaderShadow] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isNewPage) setHeaderAction(null);
  }, [isNewPage]);

  const handleContentScroll = () => {
    const el = contentScrollRef.current;
    setHeaderShadow(Boolean(el && el.scrollTop > 0));
  };

  useEffect(() => {
    handleContentScroll();
  }, [pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (userMenuRef.current && target && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const selectedCompanyId = useDashboardStore((s: any) => s.selectedCompanyId);
  const setCompanyBranding = useDashboardStore((s: any) => s.setCompanyBranding);
  const getBrandingFromCache = useDashboardStore((s: any) => s.getBrandingFromCache);
  const setBrandingInCache = useDashboardStore((s: any) => s.setBrandingInCache);
  const superAdmin = isSuperAdmin(user);

  // Cargar branding (logo, banner, colores) para el dashboard y el sidebar. Puede estar ya precargado en login.
  useEffect(() => {
    if (superAdmin && !selectedCompanyId) {
      setCompanyBranding(null);
      return;
    }
    if (!superAdmin && !user?.id) return;

    const companyId = superAdmin ? selectedCompanyId! : "me";
    const cached = superAdmin ? getBrandingFromCache(companyId) : undefined;
    if (cached !== undefined) {
      setCompanyBranding(cached);
    }

    const url = superAdmin ? `/companies/${selectedCompanyId}/branding` : "/companies/me/branding";
    apiClient
      .get<{ brandingConfig?: Record<string, string | null | undefined> | null }>(url)
      .then((data) => {
        const bc = data?.brandingConfig && typeof data.brandingConfig === "object" ? data.brandingConfig : null;
        const branding: CompanyBranding = bc
          ? {
              bannerImageUrl: bc.bannerImageUrl ?? null,
              logoImageUrl: bc.logoImageUrl ?? null,
              primaryColor: bc.primaryColor ?? null,
              primaryColorDark: bc.primaryColorDark ?? null,
              secondaryColor: bc.secondaryColor ?? null,
              secondaryColorDark: bc.secondaryColorDark ?? null,
              tertiaryColor: bc.tertiaryColor ?? null,
              tertiaryColorDark: bc.tertiaryColorDark ?? null,
            }
          : null;
        setCompanyBranding(branding);
        if (superAdmin && selectedCompanyId) setBrandingInCache(selectedCompanyId, branding);
      })
      .catch(() => {
        // No pisar branding si ya está (p. ej. precargado en login); así el sidebar no pierde logo/banner.
        const current = useDashboardStore.getState().companyBranding;
        if (!current) setCompanyBranding(null);
      });
  }, [selectedCompanyId, superAdmin, setCompanyBranding, getBrandingFromCache, setBrandingInCache, user?.id]);

  return (
    <ProtectedRoute>
      <HeaderActionContext.Provider value={setHeaderAction}>
        <div className="flex h-screen overflow-hidden bg-page">
          <DashboardSidebar />
          <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden" data-dashboard>
            <header
              className={`shrink-0 sticky top-0 z-10 flex flex-col bg-card/50 backdrop-blur-sm transition-shadow duration-200 ${
                headerShadow ? "shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2),0_1px_2px_-1px_rgba(0,0,0,0.15)]" : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 md:pt-8 pb-0 px-4 md:px-10 lg:px-12">
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
                  {isNewPage && backHref ? (
                    <div className="flex items-center gap-3">
                      <Link
                        href={backHref}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-input-border text-text-secondary hover:text-text-primary hover:bg-input-bg tracking-tight transition-colors group"
                        aria-label={backLabelKey ? t(backLabelKey) : undefined}
                      >
                        <ArrowLeft className="w-4 h-4 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform duration-150" />
                      </Link>
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-primary tracking-tight truncate">
                        {t(titleKey)}
                      </h1>
                    </div>
                  ) : (
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-primary tracking-tight truncate">
                      {t(titleKey)}
                    </h1>
                  )}
                  <p className="text-text-secondary text-sm md:text-base mt-1 md:mt-2 font-medium max-w-2xl truncate opacity-90 hidden sm:block">
                    {descriptionText}
                  </p>
                </div>
              </div>
            <div className="flex items-center gap-3 shrink-0 ml-auto">
              {headerAction && (
                <>
                  <div className="flex items-center">
                    {headerAction}
                  </div>
                  <hr
                    className="h-6 w-px border-0 bg-input-border shrink-0 self-center"
                    role="separator"
                    aria-orientation="vertical"
                  />
                </>
              )}
              <ThemeToggle />
              <LocaleToggle />
              {user && (
                <>
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen((open) => !open);
                      }}
                      className="h-10 rounded-xl bg-card border border-card-border text-text-secondary hover:text-text-primary hover:bg-input-bg transition-colors flex items-center gap-2 px-2"
                      aria-haspopup="menu"
                      aria-expanded={userMenuOpen}
                      title={getFullName(user) || user.email}
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-input-bg flex items-center justify-center border border-card-border">
                        {(user.avatarUrl ?? user.avatar)?.trim() ? (
                          <img
                            src={user.avatarUrl ?? user.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            className="w-full h-full flex items-center justify-center text-xs font-semibold text-white"
                            style={{
                              backgroundColor: getAvatarColor(user.id) ?? "var(--input-bg)",
                              color: getAvatarColor(user.id) ? "white" : "var(--text-muted)",
                            }}
                          >
                            {user.id ? getInitials(user) : "?"}
                          </span>
                        )}
                      </div>
                      <div className="hidden sm:flex flex-col items-start max-w-[140px]">
                        <span className="text-xs font-medium text-text-primary truncate">
                          {getFullName(user) || user.email}
                        </span>
                        <span className="text-[11px] text-text-muted truncate">
                          {user.email}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-text-muted transition-transform duration-150 ${
                          userMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {userMenuOpen && (
                      <div
                        className="absolute right-0 mt-2 overflow-y-auto overscroll-contain py-1.5 px-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl min-w-[160px] z-[60] bg-white dark:bg-slate-900"
                        style={{ maxHeight: "min(70vh, 400px)" }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            router.push("/dashboard/profile");
                          }}
                          className="w-full px-3 py-2 text-left text-sm transition-colors rounded-lg hover:bg-company-tertiary-subtle text-company-secondary"
                        >
                          {t("sidebar.profile")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                            if (typeof window !== "undefined") {
                              window.location.href = "/login";
                            } else {
                              router.replace("/login");
                            }
                          }}
                          className="w-full px-3 py-2 text-left text-sm transition-colors rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400"
                        >
                          {t("auth.signOut")}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
              </div>
          </header>
          <div
            ref={contentScrollRef}
            onScroll={handleContentScroll}
            className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0"
          >
            {children}
          </div>
        </main>
      </div>
      </HeaderActionContext.Provider>
    </ProtectedRoute>
  );
}

export default function DashboardLayout(props: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center p-8" />}>
      <DashboardLayoutInner {...props} />
    </Suspense>
  );
}
