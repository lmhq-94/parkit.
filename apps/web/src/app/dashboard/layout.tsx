"use client";

import React, { Suspense, createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleToggle } from "@/components/LocaleToggle";
import { Logo } from "@/components/Logo";
import { HelpModal } from "@/components/HelpModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import type { CompanyBranding } from "@/lib/store";
import { getAvatarHSLColors, getFullName, getShortName, isSuperAdmin } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { useTheme } from "next-themes";
import { useLocaleStore } from "@/lib/store";
import { Sun, Moon, ArrowLeft, ChevronDown, Menu, User, LogOut, HelpCircle } from "@/lib/premiumIcons";

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
  "/dashboard/users/[id]/edit": { title: "users.editUser", description: "users.editUserDescription", backHref: "/dashboard/users", backLabel: "tables.employees.title" },
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
  const { t, tEnum, tWithCompany, locale } = useTranslation();
  const { setLocale } = useLocaleStore();
  const selectedCompanyName = useDashboardStore((s: any) => s.selectedCompanyName);
  const toggleSidebar = useDashboardStore((s: any) => s.toggleSidebar);
  const user = useAuthStore((s: any) => s.user);
  const logout = useAuthStore((s: any) => s.logout);
  const header = getHeaderForPath(pathname ?? "");
  const isFirstCompanyFlow =
    (pathname ?? "") === "/dashboard/companies/new" && searchParams?.get("first") === "1";
  const isNewPage = Boolean(header.backHref) && !isFirstCompanyFlow;
  const isCompaniesPage = (pathname ?? "") === "/dashboard/companies";
  const isNoCompaniesPage = (pathname ?? "") === "/dashboard/no-companies";
  const useMyCompany = isCompaniesPage && !isSuperAdmin(user);
  let titleKey = useMyCompany && header.titleMyCompany ? header.titleMyCompany : header.title;
  let descriptionKey = useMyCompany && header.descriptionMyCompany ? header.descriptionMyCompany : header.description;
  let backHref = header.backHref;
  let backLabelKey = header.backLabel;

  // Customize user-creation title and description by role (ADMIN vs CUSTOMER).
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
  const [userMenuPosition, setUserMenuPosition] = useState({ top: 0, right: 0 });
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const updateUserMenuPosition = () => {
    if (userMenuRef.current) {
      const rect = userMenuRef.current.getBoundingClientRect();
      setUserMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  };

  useEffect(() => {
    if (userMenuOpen) updateUserMenuPosition();
  }, [userMenuOpen]);

  useEffect(() => {
    if (userMenuOpen) {
      const onScrollOrResize = () => updateUserMenuPosition();
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize);
      return () => {
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize);
      };
    }
  }, [userMenuOpen]);

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
      if (userMenuRef.current && target && !userMenuRef.current.contains(target) && !target.closest("[data-user-menu-dropdown]")) {
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
  const { theme, setTheme } = useTheme();

  // Load branding (logo, banner, colors) for dashboard and sidebar. It may already be preloaded on login.
  useEffect(() => {
    const superAdmin = isSuperAdmin(user);
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
              businessActivity: bc.businessActivity ?? null,
            }
          : null;
        setCompanyBranding(branding);
        if (superAdmin && selectedCompanyId) setBrandingInCache(selectedCompanyId, branding);
      })
      .catch(() => {
        // Do not overwrite branding if already present (e.g. preloaded on login); prevents sidebar logo/banner loss.
        const current = useDashboardStore.getState().companyBranding;
        if (!current) setCompanyBranding(null);
      });
  }, [selectedCompanyId, user, setCompanyBranding, getBrandingFromCache, setBrandingInCache]);

  return (
    <ProtectedRoute>
      <HeaderActionContext.Provider value={setHeaderAction}>
        <div className="flex h-screen overflow-hidden bg-page">
          <DashboardSidebar />
          <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden" data-dashboard>
            <header
              className={`shrink-0 sticky top-0 z-10 flex flex-col bg-card/50 backdrop-blur-sm transition-all duration-200 ${
                headerShadow 
                  ? "border-b border-card-border pb-3 md:pb-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2),0_1px_2px_-1px_rgba(0,0,0,0.15)]" 
                  : "pb-0"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 md:pt-5 pb-0 px-4 md:px-8 lg:px-10">
              <div className="flex items-center gap-3 min-w-0">
                {/* Hamburger: mobile only */}
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
                      <h1 className="text-xl md:text-2xl lg:text-[1.75rem] premium-title truncate">
                        {t(titleKey)}
                      </h1>
                    </div>
                  ) : (
                    isNoCompaniesPage ? (
                      <Logo className="text-3xl" />
                    ) : (
                      <h1 className="text-xl md:text-2xl lg:text-[1.75rem] premium-title truncate">
                        {t(titleKey)}
                      </h1>
                    )
                  )}
                  {!isNoCompaniesPage && (
                    <p className="premium-subtitle text-sm md:text-[0.95rem] mt-1.5 md:mt-2 max-w-2xl truncate hidden sm:block">
                      {descriptionText}
                    </p>
                  )}
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
              {/* Theme and Locale toggles moved inside user menu for mobile optimization */}
              <div className="hidden md:flex items-center gap-3">
                <ThemeToggle />
                <LocaleToggle />
              </div>
              {user && (
                <>
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => {
                        // Pre-calculate position before opening to avoid initial jump
                        if (!userMenuOpen && userMenuRef.current) {
                          const rect = userMenuRef.current.getBoundingClientRect();
                          setUserMenuPosition({
                            top: rect.bottom + 4,
                            right: window.innerWidth - rect.right,
                          });
                        }
                        setUserMenuOpen((open) => !open);
                      }}
                      className={`group relative h-11 pl-1 pr-3 flex items-center gap-2.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                        userMenuOpen
                          ? "bg-white/80 dark:bg-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3)] ring-2 ring-company-primary/20"
                          : "bg-white/60 dark:bg-slate-900/60 hover:bg-white/90 dark:hover:bg-slate-800/90 shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.3)] backdrop-blur-xl border border-white/40 dark:border-white/10"
                      }`}
                      aria-haspopup="menu"
                      aria-expanded={userMenuOpen}
                      title={getFullName(user) || user.email}
                    >
                      {(() => {
                        const avatarColors = getAvatarHSLColors(user.id, theme === "dark");
                        const hasAvatar = (user.avatarUrl ?? user.avatar)?.trim();
                        return (
                              <div
                            className={`relative w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-300 ease-out ${
                              userMenuOpen ? "scale-95" : "group-hover:scale-105"
                            }`}
                            style={{
                              backgroundColor: hasAvatar ? undefined : avatarColors.bg,
                              border: hasAvatar
                                ? '1px solid rgba(0,0,0,0.06)'
                                : `2px solid ${avatarColors.border}`,
                              boxShadow: hasAvatar
                                ? '0 4px 12px -2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                                : '0 2px 8px -2px rgba(0,0,0,0.08)',
                            }}
                          >
                            {hasAvatar ? (
                              <Image
                                src={user.avatarUrl ?? user.avatar}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="36px"
                                unoptimized
                              />
                            ) : (
                              <User
                                className="w-[18px] h-[18px]"
                                style={{ color: avatarColors.fg }}
                              />
                            )}
                          </div>
                        );
                      })()}
                      <div className="hidden sm:flex flex-col items-start max-w-[140px] min-w-0">
                        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                          {getShortName(user) || getFullName(user) || user.email}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                          {user.email}
                        </span>
                      </div>
                      <div className={`ml-1 flex items-center justify-center w-5 h-5 rounded-md bg-slate-100/80 dark:bg-slate-800/80 transition-all duration-300 ${
                        userMenuOpen ? "rotate-180 bg-company-primary/10" : "group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/80"
                      }`}>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-colors duration-300 ${
                            userMenuOpen ? "text-company-primary" : "text-slate-500 dark:text-slate-400"
                          }`}
                        />
                      </div>
                    </button>
                    {userMenuOpen && typeof document !== "undefined" && createPortal(
                      <div
                        data-user-menu-dropdown
                        className="fixed z-[99999] flex flex-col rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        style={{
                          top: userMenuPosition.top,
                          right: userMenuPosition.right,
                          left: "auto",
                          maxHeight: "min(70vh, 420px)",
                          minWidth: "220px",
                          background: theme === "dark"
                            ? "linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)"
                            : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.99) 100%)",
                          boxShadow: theme === "dark"
                            ? "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), 0 10px 20px -5px rgba(0,0,0,0.4)"
                            : "0 25px 50px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.8) inset, 0 10px 20px -5px rgba(0,0,0,0.1)",
                          backdropFilter: "blur(24px) saturate(180%)",
                        }}
                      >
                        <div className="p-1 overflow-y-auto overscroll-contain min-h-0 flex-1">
                          {/* Context: Role */}
                          <div className="px-3 py-2">
                            <span className="text-[10px] font-medium text-company-primary uppercase tracking-wider">
                              {tEnum("systemRole", user.systemRole)}
                            </span>
                          </div>

                          {/* Only show divider when My Profile is visible */}
                          {selectedCompanyId && <div className="h-px mx-3 bg-slate-100 dark:bg-slate-800" />}

                          {/* Only show My Profile when a company is selected */}
                          {selectedCompanyId && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserMenuOpen(false);
                                router.push("/dashboard/profile");
                              }}
                              className="group w-full px-3 py-2 text-left text-[13px] rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                            >
                              <User className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                              <span>{t("sidebar.profile")}</span>
                            </button>
                          )}

                          {/* Mobile theme & language - more compact */}
                          <div className="md:hidden px-2 py-2 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("settings.theme")}</span>
                              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTheme("light");
                                    apiClient.patch("/users/me", { appPreferences: { theme: "light" } }).catch(() => {});
                                  }}
                                  className={`p-1.5 rounded-md transition-all ${theme === "light" ? "bg-white text-amber-500 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                  <Sun className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTheme("dark");
                                    apiClient.patch("/users/me", { appPreferences: { theme: "dark" } }).catch(() => {});
                                  }}
                                  className={`p-1.5 rounded-md transition-all ${theme === "dark" ? "bg-slate-700 text-indigo-300 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                  <Moon className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("settings.language")}</span>
                              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLocale("es");
                                    apiClient.patch("/users/me", { appPreferences: { locale: "es" } }).catch(() => {});
                                  }}
                                  className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${locale === "es" ? "bg-white text-company-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                  ES
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLocale("en");
                                    apiClient.patch("/users/me", { appPreferences: { locale: "en" } }).catch(() => {});
                                  }}
                                  className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${locale === "en" ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                  EN
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="h-px mx-3 my-1 bg-slate-100 dark:bg-slate-800" />

                          {/* Help */}
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              setHelpModalOpen(true);
                            }}
                            className="group w-full px-3 py-2 text-left text-[13px] rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                          >
                            <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                            <span>{t("sidebar.help")}</span>
                          </button>

                          <div className="h-px mx-3 my-1 bg-slate-100 dark:bg-slate-800" />

                          {/* Logout */}
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
                            className="group w-full px-3 py-2 text-left text-[13px] rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2.5"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t("auth.signOut")}</span>
                          </button>
                        </div>
                      </div>,
                      document.body
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
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
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
