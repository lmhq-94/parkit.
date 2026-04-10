"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore, useDashboardStore, SIDEBAR_COLLAPSED_KEY } from "@/lib/store";
import { getAvatarColor, isSuperAdmin, isAdmin } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { DefaultBanner } from "@/components/DefaultBanner";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import {
  LayoutDashboard,
  Users,
  Shield,
  User,
  Car,
  MapPin,
  Calendar,
  TicketCheck,
  Bell,
  Settings,
  ChevronsRight,
  ChevronsLeft,
  ChevronRight,
  ChevronDown,
  Building,
  Plus,
  LogOut,
} from "lucide-react";

function SidebarTooltip({
  show,
  label,
  children,
}: {
  show: boolean;
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 10,
      });
    }
  };

  const handleMouseEnter = () => {
    if (show && label) {
      updatePosition();
      setVisible(true);
    }
  };

  const handleMouseLeave = () => setVisible(false);

  const tooltipEl =
    visible &&
    show &&
    label &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="fixed z-[99999] px-3 py-2 text-sm font-medium text-white bg-slate-800 dark:bg-slate-700 rounded-lg shadow-xl border border-slate-700/50 dark:border-slate-600/50 whitespace-nowrap pointer-events-none transition-opacity duration-150"
        style={{
          left: position.left,
          top: position.top,
          transform: "translateY(-50%)",
        }}
      >
        {label}
        {/* Flecha hacia el sidebar */}
        <span
          className="absolute top-1/2 w-0 h-0 -translate-y-1/2 border-[6px] border-transparent border-r-slate-800 dark:border-r-slate-700"
          style={{ right: "100%" }}
          aria-hidden
        />
      </div>,
      document.body
    );

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full"
    >
      {children}
      {tooltipEl}
    </div>
  );
}

const SELECTED_COMPANY_KEY = "parkit_selected_company_id";
const SELECTED_COMPANY_NAME_KEY = "parkit_selected_company_name";

/** Luminancia media (0–1) de la mitad inferior del banner. Null si no se pudo analizar (ej. CORS). */
function getBannerLuminance(imageSrc: string): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined" || !imageSrc) {
      resolve(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = 64;
        const h = 64;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let sum = 0;
        let count = 0;
        for (let y = Math.floor(h / 2); y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            sum += luminance;
            count++;
          }
        }
        resolve(count > 0 ? sum / count : null);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageSrc;
  });
}

function CompanySelector({
  companies,
  selectedCompanyId,
  selectedCompanyName,
  onSelect,
  placeholder,
  allCompaniesLabel,
  emptyLabel,
  isDark = false,
  logoImageUrl,
  hideAvatar = false,
  highContrast = false,
}: {
  companies: { id: string; commercialName?: string; legalName?: string; requiresCustomerApp?: boolean }[];
  selectedCompanyId: string | null;
  selectedCompanyName: string | null;
  onSelect: (id: string, name: string, requiresCustomerApp?: boolean) => void;
  placeholder: string;
  allCompaniesLabel: string;
  emptyLabel: string;
  isDark?: boolean;
  logoImageUrl?: string | null;
  /** Cuando es true, no se muestra el círculo con avatar/logo (para usar dentro del banner sin duplicar avatar). */
  hideAvatar?: boolean;
  /** Fuerza contraste alto para usarse sobre banners con cualquier fondo. */
  highContrast?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left: number; width: number }>({ left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = typeof window !== "undefined" ? window.innerHeight - rect.bottom - 24 : 200;
      const openUp = spaceBelow < 180;
      setPosition({
        top: openUp ? undefined : rect.bottom + 4,
        bottom: openUp && typeof window !== "undefined" ? window.innerHeight - rect.top + 4 : undefined,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!triggerRef.current?.contains(target) && !target.closest("[data-company-dropdown]")) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const companyInitials = (name: string) => {
    const n = (name || "").trim();
    const parts = n.split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (n.length >= 2) return n.slice(0, 2).toUpperCase();
    if (n.length === 1) return n[0].toUpperCase();
    return "?";
  };

  const dropdownStyles: React.CSSProperties = {
    background: isDark
      ? "linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)"
      : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.99) 100%)",
    boxShadow: isDark
      ? "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), 0 10px 20px -5px rgba(0,0,0,0.4)"
      : "0 25px 50px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.8) inset, 0 10px 20px -5px rgba(0,0,0,0.1)",
    backdropFilter: "blur(24px) saturate(180%)",
  };

  const dropdown = open && typeof document !== "undefined" && createPortal(
    <div
      data-company-dropdown
      className="fixed z-[99999] flex flex-col rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{
        ...dropdownStyles,
        top: position.top,
        bottom: position.bottom,
        left: position.left,
        minWidth: 160,
        maxHeight: "min(70vh, 420px)",
      }}
    >
      <div className="p-1.5 overflow-y-auto overscroll-contain min-h-0 flex-1 space-y-0.5">
        {companies.map((c) => {
          const name = c.commercialName || c.legalName || c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => { onSelect(c.id, name, c.requiresCustomerApp); setOpen(false); }}
              className={`group w-full px-3 py-2.5 text-left text-sm transition-all duration-200 rounded-lg truncate flex items-center gap-3 ${
                selectedCompanyId === c.id
                  ? "bg-company-primary/10 dark:bg-company-primary/20 text-slate-800 dark:text-white font-medium"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
              }`}
            >
              {selectedCompanyId === c.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-company-primary shrink-0" />
              )}
              <span className="truncate font-medium">{name}</span>
            </button>
          );
        })}
        {companies.length === 0 && (
          <p className="px-3 py-3 text-sm text-slate-400 text-center">{emptyLabel}</p>
        )}
      </div>
      <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-1 mt-1 px-1.5 pb-1.5">
        <Link
          href="/dashboard/companies"
          onClick={() => setOpen(false)}
          className="block px-3 py-2.5 text-left text-sm text-company-primary hover:bg-company-primary/10 dark:hover:bg-company-primary/20 transition-all rounded-lg font-medium"
        >
          {allCompaniesLabel}
        </Link>
      </div>
    </div>,
    document.body
  );

  const selectedName = selectedCompanyName || "";
  const selectedInitials = companyInitials(selectedName);

  return (
    <>
      <div className="relative flex items-center gap-3">
        {!hideAvatar && (
          <div
            className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-xs font-semibold border border-white/20 overflow-hidden bg-input-bg"
            style={
              !logoImageUrl?.trim()
                ? {
                    backgroundColor: selectedCompanyId ? (getAvatarColor(selectedCompanyId) ?? "var(--input-bg)") : "transparent",
                    color: "white",
                  }
                : undefined
            }
          >
            {logoImageUrl?.trim() ? (
              <Image src={logoImageUrl} alt="" width={40} height={40} className="w-full h-full object-cover object-center" key={logoImageUrl} />
            ) : selectedCompanyId ? (
              selectedInitials
            ) : (
              <Building className={`w-4 h-4 ${isDark ? "text-white/60" : "text-slate-500"}`} />
            )}
          </div>
        )}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => { if (!open) updatePosition(); setOpen((o) => !o); }}
          className={`flex-1 flex items-center min-w-0 ${hideAvatar ? "pl-4" : "pl-3"} pr-9 py-2.5 rounded-lg text-left text-sm transition-all duration-300 ease-out ${
            highContrast
              ? `bg-white/25 hover:bg-white/35 ${isDark ? "text-white" : "text-slate-800"} border border-white/30 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08),0_1px_2px_rgba(255,255,255,0.3)_inset] backdrop-blur-xl hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.1)] hover:border-white/50 hover:scale-[1.02]`
              : isDark
                ? "bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.2)] backdrop-blur-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
                : "bg-white/25 text-slate-800 border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(255,255,255,0.4)_inset,0_8px_16px_rgba(255,255,255,0.1)_inset] backdrop-blur-2xl hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),0_1px_2px_rgba(255,255,255,0.5)_inset] hover:bg-white/35 hover:border-white/90"
          } ${open ? "ring-2 ring-company-primary/40 shadow-[0_0_20px_rgba(var(--company-primary-rgb),0.2)]" : ""} ${highContrast ? "max-w-[220px] justify-center text-center" : ""}`}
        >
          <span className="truncate flex-1 font-medium">
            {selectedCompanyName || (
              <span className={highContrast ? "text-slate-500" : isDark ? "text-white/60" : "text-slate-500"}>
                {placeholder}
              </span>
            )}
          </span>
        </button>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-all duration-300 ease-out ${
            open ? "rotate-180" : ""
          } ${highContrast ? "text-slate-500" : isDark ? "text-white/70" : "text-slate-500"}`}
        />
      </div>
      {dropdown}
    </>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    selectedCompanyId,
    selectedCompanyName,
    setSelectedCompany,
    sidebarCollapsed: collapsed,
    setSidebarCollapsed,
    sidebarOpen,
    toggleSidebar,
    companiesVersion,
    parkingsVersion,
    companyBranding,
  } = useDashboardStore();
  const [mounted, setMounted] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; commercialName?: string; legalName?: string; requiresCustomerApp?: boolean }[]>([]);
  const [adminCompanyName, setAdminCompanyName] = useState<string | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [bannerIsDark, setBannerIsDark] = useState<boolean | null>(null);
  const [hasBookableParkings, setHasBookableParkings] = useState(false);

  const superAdmin = isSuperAdmin(user);
  const admin = isAdmin(user);
  // SUPER_ADMIN: has companies if loaded list has entries. ADMIN/STAFF: always have a company; do not show "create company" while /companies/me loads (avoids flicker).
  const hasCompanies = superAdmin
    ? companies.length > 0
    : Boolean(adminCompanyName) || Boolean(user?.id);
  const isDark = resolvedTheme === "dark";

  const bannerDefaultSrc = isDark
    ? "/images/default-banner-dark.png"
    : "/images/default-banner-light.png";
  const brandingBanner = companyBranding?.bannerImageUrl;
  const hasCustomBanner =
    typeof brandingBanner === "string" && brandingBanner.trim().length > 0;
  const effectiveBannerSrc = hasCustomBanner ? brandingBanner! : bannerDefaultSrc;

  const bannerVariant = hasCustomBanner ? (bannerIsDark ?? isDark) : isDark;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hasCustomBanner || !effectiveBannerSrc) return;
    let cancelled = false;
    getBannerLuminance(effectiveBannerSrc).then((luminance) => {
      if (!cancelled) setBannerIsDark(luminance !== null ? luminance < 0.5 : null);
    });
    return () => {
      cancelled = true;
    };
  }, [hasCustomBanner, effectiveBannerSrc]);

  // Hydrate collapsed state from localStorage (only matters on first load; store already has it while navigating)
  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    setSidebarCollapsed(stored === "true");
  }, [mounted, setSidebarCollapsed]);

  useEffect(() => {
    if (!mounted) return;
    const id = localStorage.getItem(SELECTED_COMPANY_KEY);
    const name = localStorage.getItem(SELECTED_COMPANY_NAME_KEY);
    if (id && name) setSelectedCompany(id, name);
  }, [mounted, setSelectedCompany]);

  useEffect(() => {
    if (!superAdmin) return;
    apiClient
      .get<{ id: string; commercialName?: string; legalName?: string }[]>("/companies")
      .then((data) => setCompanies(Array.isArray(data) ? data : []))
      .catch(() => setCompanies([]));
  }, [superAdmin, companiesVersion]);

  // SUPER_ADMIN: always keep a selected company (first one if none selected or current one no longer exists)
  useEffect(() => {
    if (!superAdmin || companies.length === 0) return;
    const currentId = useDashboardStore.getState().selectedCompanyId;
    const currentExists = currentId && companies.some((c) => c.id === currentId);
    if (currentExists) return;
    const first = companies[0];
    const name = first.commercialName || first.legalName || first.id;
    setSelectedCompany(first.id, name, first.requiresCustomerApp);
  }, [superAdmin, companies, setSelectedCompany]);

  // For ADMIN: fetch company (name and id) and, if none is selected, set it so layout can load branding
  useEffect(() => {
    if (!mounted || !user || superAdmin) return;
    apiClient
      .get<{ id?: string; commercialName?: string; legalName?: string; email?: string; requiresCustomerApp?: boolean }>("/companies/me")
      .then((company) => {
        const name = company?.commercialName || company?.legalName || null;
        setAdminCompanyName(name ?? null);
        if (company?.id && name) {
          setSelectedCompany(company.id, name, company.requiresCustomerApp);
        }
      })
      .catch(() => {
        setAdminCompanyName(null);
      });
  }, [mounted, user?.id, superAdmin, setSelectedCompany, user]);

  // Unread notifications count for sidebar badge (refreshes on navigation)
  useEffect(() => {
    if (!user?.id) return;
    apiClient
      .get<{ count: number }>(`/notifications/user/${user.id}/unread-count`)
      .then((data) => setUnreadNotificationsCount(data?.count ?? 0))
      .catch(() => setUnreadNotificationsCount(0));
  }, [user?.id, pathname]);

  // Show "Bookings" only if company has at least one parking that requires booking
  useEffect(() => {
    const hasCompanyContext = superAdmin ? Boolean(selectedCompanyId) : Boolean(user?.id);
    if (!hasCompanyContext) {
      setHasBookableParkings(false);
      return;
    }
    apiClient
      .get<{ hasBookable?: boolean }>("/parkings/has-bookable")
      .then((data) => setHasBookableParkings(Boolean(data?.hasBookable)))
      .catch(() => setHasBookableParkings(false));
  }, [superAdmin, selectedCompanyId, user?.id, companiesVersion, parkingsVersion, pathname]);

  const toggleCollapsed = () => setSidebarCollapsed(!collapsed);

  const handleNavClick = () => {
    if (sidebarOpen) {
      toggleSidebar();
    }
  };

  const handleSelectCompany = (id: string, name: string, requiresCustomerApp?: boolean) => {
    setSelectedCompany(id, name, requiresCustomerApp);
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
  };

  const navGroups = useMemo(() => {
    const mainItems = [
      { label: t("sidebar.overview"), href: "/dashboard", icon: LayoutDashboard },
      { label: t("sidebar.parkings"), href: "/dashboard/parkings", icon: MapPin },
      ...(hasBookableParkings ? [{ label: t("sidebar.bookings"), href: "/dashboard/bookings", icon: Calendar }] : []),
      { label: t("sidebar.tickets"), href: "/dashboard/tickets", icon: TicketCheck },
    ];

    const teamItems = [
      ...(admin ? [{ label: t("sidebar.employees"), href: "/dashboard/users", icon: Shield }] : []),
      ...(superAdmin ? [{ label: t("sidebar.valets"), href: "/dashboard/valets", icon: User }] : []),
    ];

    const clientsItems = [
      { label: t("sidebar.customers"), href: "/dashboard/customers", icon: Users },
      { label: t("sidebar.vehicles"), href: "/dashboard/vehicles", icon: Car },
    ];

    return [
      {
        label: t("sidebar.main"),
        items: mainItems,
      },
      {
        label: t("sidebar.team"),
        items: teamItems,
      },
      {
        label: t("sidebar.clients"),
        items: clientsItems,
      },
      {
        label: t("sidebar.account"),
        items: [
          { label: t("sidebar.notifications"), href: "/dashboard/notifications", icon: Bell },
          { label: t("sidebar.settings"), href: "/dashboard/settings", icon: Settings },
        ],
      },
    ];
  }, [t, hasBookableParkings, admin, superAdmin]);

  // Don't render sidebar if no companies exist
  if (!hasCompanies) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[20000] bg-black/50 md:hidden"
          aria-hidden
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-[20001] md:z-30
          h-screen flex flex-col overflow-hidden bg-gradient-to-b from-page via-page to-page/95 
          backdrop-blur-2xl border-r border-card-border/40 dark:border-white/[0.11]
          transition-[width,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shrink-0
          w-[260px] ${collapsed ? "md:w-[76px]" : "md:w-[264px]"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ 
          boxShadow: isDark 
            ? "4px 0 32px -8px rgba(0,0,0,0.4), 1px 0 0 rgba(255,255,255,0.03) inset" 
            : "4px 0 32px -8px rgba(0,0,0,0.12), 1px 0 0 rgba(255,255,255,0.4) inset",
        }}
      >
      {/* Logo / brand */}
      <div
        className={`flex flex-col border-b border-card-border/25 dark:border-white/[0.04] shrink-0 bg-gradient-to-b from-white/[0.02] to-transparent ${
          collapsed ? "items-center justify-center py-4 px-2" : "px-5 pt-5 pb-4"
        }`}
      >
        {collapsed ? (
          <SidebarTooltip show label={t("sidebar.expand")}>
            <button
              onClick={toggleCollapsed}
              className="p-2.5 rounded-lg text-text-muted hover:text-company-primary hover:bg-company-primary/10 transition-all duration-300 ease-out w-full flex justify-center group"
              aria-label="Expand sidebar"
            >
              <ChevronsLeft className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            </button>
          </SidebarTooltip>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <Link href="/dashboard" className="flex items-center min-w-0 overflow-hidden">
                <Logo variant={isDark ? "onDark" : "default"} className="text-3xl truncate" />
              </Link>
              {/* Collapse button: only visible on md+ */}
              <button
                onClick={toggleCollapsed}
                className="hidden md:flex p-2 rounded-lg text-text-muted hover:text-company-primary hover:bg-company-primary/10 transition-all duration-300 ease-out shrink-0 group"
                aria-label="Collapse sidebar"
              >
                <ChevronsRight className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Company banner + selector (SUPER_ADMIN) o banner con avatar (ADMIN) */}
      {!collapsed && (
        <>
          {hasCompanies ? (
            <>
              {superAdmin ? (
                <div className="border-b border-card-border/25 dark:border-white/[0.04] shrink-0">
                  <DefaultBanner
                    companyName={selectedCompanyName || t("sidebar.company")}
                    logoImageUrl={companyBranding?.logoImageUrl}
                    subtitle={t("sidebar.companyTagline")}
                    businessActivity={companyBranding?.businessActivity}
                    isDark={hasCustomBanner ? bannerVariant : isDark}
                    backgroundImageUrl={hasCustomBanner ? effectiveBannerSrc : null}
                    renderRight={
                      <div className="flex w-full justify-center">
                        <CompanySelector
                          companies={companies}
                          selectedCompanyId={selectedCompanyId}
                          selectedCompanyName={selectedCompanyName}
                          onSelect={handleSelectCompany}
                          placeholder={t("sidebar.selectCompany")}
                          allCompaniesLabel={t("sidebar.allCompanies")}
                          emptyLabel={t("companies.noCompanies")}
                          isDark={hasCustomBanner ? bannerVariant : isDark}
                          logoImageUrl={companyBranding?.logoImageUrl}
                          hideAvatar
                          highContrast
                        />
                      </div>
                    }
                  />
                </div>
              ) : (
                <div className="border-b border-card-border/25 dark:border-white/[0.04] shrink-0">
                  <DefaultBanner
                    companyName={adminCompanyName || t("companies.single") || "Company"}
                    logoImageUrl={companyBranding?.logoImageUrl}
                    subtitle={t("sidebar.companyTagline")}
                    businessActivity={companyBranding?.businessActivity}
                    isDark={hasCustomBanner ? bannerVariant : isDark}
                    backgroundImageUrl={hasCustomBanner ? effectiveBannerSrc : null}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="border-b border-card-border/25 dark:border-white/[0.04] px-3 py-3 shrink-0">
              <Link
                href="/dashboard/companies/new?first=1"
                className="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-text-muted hover:bg-input-bg hover:text-text-secondary"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-all duration-200 bg-company-primary/10 text-company-primary group-hover:bg-company-primary/15">
                  <Building className="w-5 h-5" />
                </span>
                <span className="font-medium truncate">
                  {t("companies.createCompany")}
                </span>
              </Link>
            </div>
          )}
        </>
      )}

      {/* Nav groups: flex-1 + min-h-0 so only this area scrolls, not the whole sidebar */}
      {hasCompanies ? (
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-company-tertiary/70">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const linkContent = (
                    <>
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-gradient-to-b from-company-primary to-company-primary/70 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_0_12px_rgba(var(--company-primary-rgb),0.4)] ${
                          isActive ? "opacity-100 h-7" : "opacity-0 h-0"
                        }`}
                      />
                      <span className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-all duration-300 ease-out ${
                          isActive 
                            ? "bg-gradient-to-br from-company-primary/20 to-company-primary/5 shadow-[0_2px_8px_-2px_rgba(var(--company-primary-rgb),0.2)]" 
                            : "group-hover:bg-input-bg/50"
                        }`}>
                        <Icon
                          className={`w-[18px] h-[18px] transition-all duration-300 ${
                            isActive ? "text-company-primary scale-105" : "text-company-tertiary group-hover:text-company-secondary group-hover:scale-105"
                          }`}
                        />
                      </span>
                      {!collapsed && (
                        <>
                          <span
                            className={`font-medium truncate transition-colors duration-300 ${
                              isActive ? "text-text-primary font-semibold" : "text-company-tertiary group-hover:text-company-secondary"
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.href === "/dashboard/notifications" && unreadNotificationsCount > 0 && (
                            <span className="min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white text-[11px] font-bold shrink-0 ml-auto shadow-lg shadow-red-500/25">
                              {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                            </span>
                          )}
                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-company-primary shrink-0 ml-auto opacity-70" />
                          )}
                        </>
                      )}
                      {collapsed && item.href === "/dashboard/notifications" && unreadNotificationsCount > 0 && (
                        <span
                          className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-red-500 to-red-600 ring-[2.5px] ring-page shadow-sm"
                          aria-label={`${unreadNotificationsCount} sin leer`}
                        />
                      )}
                    </>
                  );
                  return (
                    <li key={item.href}>
                      <SidebarTooltip show={collapsed} label={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => {
                            handleNavClick();
                          }}
                          className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                            collapsed ? "justify-center mx-1" : "mx-1"
                          } ${
                            isActive
                              ? "bg-gradient-to-r from-company-primary/10 via-company-primary/5 to-transparent text-text-primary shadow-[0_1px_3px_-1px_rgba(0,0,0,0.05)]"
                              : "text-text-muted hover:bg-gradient-to-r hover:from-input-bg/80 hover:to-transparent hover:text-text-secondary"
                          }`}
                        >
                          {linkContent}
                        </Link>
                      </SidebarTooltip>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      ) : (
        <div className="flex-1" />
      )}

      {/* Footer: Copyright */}
      <footer className="bg-gradient-to-b from-transparent via-page/50 to-page px-3 py-3.5 shrink-0">
        {!collapsed ? (
          <div className="flex flex-col items-start gap-1 px-3">
            <p className="text-[9px] text-text-muted dark:text-company-tertiary/60 text-left leading-tight">
              © {new Date().getFullYear()} Parkit. {t("sidebar.allRightsReserved")}
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="text-[8px] text-text-muted dark:text-company-tertiary/40">©{String(new Date().getFullYear()).slice(-2)}</span>
          </div>
        )}
      </footer>
    </aside>
    </>
  );
}
