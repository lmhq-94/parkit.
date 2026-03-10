"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore, useDashboardStore, SIDEBAR_COLLAPSED_KEY } from "@/lib/store";
import { getFullName, getAvatarColor, getInitials, isSuperAdmin } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import {
  LogOut,
  LayoutDashboard,
  Users,
  UserRound,
  Car,
  MapPin,
  CalendarCheck,
  Ticket,
  Bell,
  Settings,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  ChevronDown,
  Building2,
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
    const img = new Image();
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
  companies, selectedCompanyId, selectedCompanyName, onSelect, placeholder, allCompaniesLabel, emptyLabel, isDark = false, logoImageUrl,
}: {
  companies: { id: string; commercialName?: string; legalName?: string }[];
  selectedCompanyId: string | null;
  selectedCompanyName: string | null;
  onSelect: (id: string, name: string) => void;
  placeholder: string;
  allCompaniesLabel: string;
  emptyLabel: string;
  isDark?: boolean;
  logoImageUrl?: string | null;
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

  const dropdown = open && typeof document !== "undefined" && createPortal(
    <div
      data-company-dropdown
      className="fixed z-[99999] flex flex-col rounded-xl shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl py-1.5 pl-3 pr-1.5"
      style={{
        top: position.top,
        bottom: position.bottom,
        left: position.left,
        width: Math.max(position.width, 220),
        maxHeight: "min(70vh, 400px)",
      }}
    >
      <div className="overflow-y-auto overscroll-contain min-h-0 flex-1">
        {companies.map((c) => {
          const name = c.commercialName || c.legalName || c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => { onSelect(c.id, name); setOpen(false); }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors rounded-lg truncate ${
                selectedCompanyId === c.id
                  ? "bg-company-primary-muted text-company-primary font-medium"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {name}
            </button>
          );
        })}
        {companies.length === 0 && (
          <p className="px-3 py-3 text-sm text-slate-400 text-center">{emptyLabel}</p>
        )}
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 mt-1 pt-1">
        <Link
          href="/dashboard/companies"
          onClick={() => setOpen(false)}
          className="block w-full px-3 py-2 text-left text-sm text-company-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-lg"
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
        <div
          className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold border border-white/20 overflow-hidden bg-input-bg"
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
            <img src={logoImageUrl} alt="" className="w-full h-full object-cover" key={logoImageUrl} />
          ) : selectedCompanyId ? (
            selectedInitials
          ) : (
            <Building2 className={`w-4 h-4 ${isDark ? "text-white/60" : "text-slate-500"}`} />
          )}
        </div>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => { if (!open) updatePosition(); setOpen((o) => !o); }}
          className={`flex-1 flex items-center min-w-0 pl-2 pr-8 py-2.5 rounded-xl text-left text-sm transition-colors ${
            isDark
              ? "bg-white/15 hover:bg-white/25 text-white placeholder:text-white/60"
              : "bg-black/10 hover:bg-black/15 text-slate-900 placeholder:text-slate-600"
          } ${open ? "ring-2 ring-white/50" : ""}`}
        >
          <span className="truncate flex-1">
            {selectedCompanyName || <span className={isDark ? "text-white/70" : "text-slate-500"}>{placeholder}</span>}
          </span>
        </button>
        <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform duration-200 ${open ? "rotate-180" : ""} ${isDark ? "text-white/80" : "text-slate-600"}`} />
      </div>
      {dropdown}
    </>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { selectedCompanyId, selectedCompanyName, setSelectedCompany, sidebarCollapsed: collapsed, setSidebarCollapsed, sidebarOpen, toggleSidebar, companiesVersion, parkingsVersion, companyBranding } = useDashboardStore();
  const [mounted, setMounted] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; commercialName?: string; legalName?: string }[]>([]);
  const [adminCompanyName, setAdminCompanyName] = useState<string | null>(null);
  const [adminCompanyEmail, setAdminCompanyEmail] = useState<string | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [bannerIsDark, setBannerIsDark] = useState<boolean | null>(null);
  const [hasBookableParkings, setHasBookableParkings] = useState(false);

  const superAdmin = isSuperAdmin(user);
  const isAdminRole = user?.systemRole === "ADMIN";
  const isDark = resolvedTheme === "dark";

  const bannerDefaultSrc = isDark
    ? "/images/default-banner-dark.png"
    : "/images/default-banner-light.png";
  const brandingBanner = companyBranding?.bannerImageUrl;
  const effectiveBannerSrc =
    typeof brandingBanner === "string" && brandingBanner.trim()
      ? brandingBanner
      : bannerDefaultSrc;

  const bannerVariant = bannerIsDark ?? isDark;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!effectiveBannerSrc) return;
    let cancelled = false;
    getBannerLuminance(effectiveBannerSrc).then((luminance) => {
      if (!cancelled) setBannerIsDark(luminance !== null ? luminance < 0.5 : null);
    });
    return () => {
      cancelled = true;
    };
  }, [effectiveBannerSrc]);

  // Hidratar estado colapsado desde localStorage (solo importa en la primera carga; al navegar el store ya tiene el valor)
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

  // Para ADMIN: obtener empresa (nombre e id) y, si no hay company seleccionada, fijarla para que el layout cargue branding
  useEffect(() => {
    if (!mounted || !user || superAdmin) return;
    apiClient
      .get<{ id?: string; commercialName?: string; legalName?: string; email?: string }>("/companies/me")
      .then((company) => {
        const name = company?.commercialName || company?.legalName || null;
        setAdminCompanyName(name ?? null);
        setAdminCompanyEmail(company?.email ?? null);
        if (company?.id && name) {
          setSelectedCompany(company.id, name);
        }
      })
      .catch(() => {
        setAdminCompanyName(null);
        setAdminCompanyEmail(null);
      });
  }, [mounted, user?.id, superAdmin, setSelectedCompany]);

  // Contador de notificaciones sin leer para el badge del sidebar (se refresca al navegar)
  useEffect(() => {
    if (!user?.id) return;
    apiClient
      .get<{ count: number }>(`/notifications/user/${user.id}/unread-count`)
      .then((data) => setUnreadNotificationsCount(data?.count ?? 0))
      .catch(() => setUnreadNotificationsCount(0));
  }, [user?.id, pathname]);

  // Mostrar "Reservas" solo si la empresa tiene al menos un estacionamiento que requiere reserva
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

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleSelectCompany = (id: string, name: string) => {
    setSelectedCompany(id, name);
  };

  const navGroups = useMemo(() => {
    const mainItems = [
      { label: t("sidebar.overview"), href: "/dashboard", icon: LayoutDashboard },
      { label: t("sidebar.employees"), href: "/dashboard/users", icon: Users },
      { label: t("sidebar.valets"), href: "/dashboard/valets", icon: UserRound },
      { label: t("sidebar.vehicles"), href: "/dashboard/vehicles", icon: Car },
      { label: t("sidebar.parkings"), href: "/dashboard/parkings", icon: MapPin },
      ...(hasBookableParkings ? [{ label: t("sidebar.bookings"), href: "/dashboard/bookings", icon: CalendarCheck }] : []),
      { label: t("sidebar.tickets"), href: "/dashboard/tickets", icon: Ticket },
    ];
    return [
      {
        label: t("sidebar.main"),
        items: mainItems,
      },
      {
        label: t("sidebar.account"),
        items: [
          { label: t("sidebar.notifications"), href: "/dashboard/notifications", icon: Bell },
          { label: t("sidebar.settings"), href: "/dashboard/settings", icon: Settings },
        ],
      },
    ];
  }, [t, hasBookableParkings]);

  return (
    <>
      {/* Overlay móvil */}
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
        min-h-screen flex flex-col bg-page backdrop-blur-xl border-r border-card-border
        transition-[width,transform] duration-300 ease-out shrink-0
        w-[260px] ${collapsed ? "md:w-[72px]" : "md:w-[260px]"}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      style={{ boxShadow: "4px 0 24px -4px rgba(0,0,0,0.1)" }}
    >
      {/* Logo / brand */}
      <div
        className={`flex flex-col border-b border-card-border shrink-0 ${
          collapsed ? "items-center justify-center py-3 px-2" : "px-4 pt-4 pb-3"
        }`}
      >
        {collapsed ? (
          <SidebarTooltip show label={t("sidebar.expand")}>
            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-input-bg transition-colors w-full flex justify-center"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          </SidebarTooltip>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <Link href="/dashboard" className="flex items-center min-w-0 overflow-hidden">
                <Logo variant={isDark ? "onDark" : "default"} className="text-3xl truncate" />
              </Link>
              {/* Botón colapsar: solo visible en md+ */}
              <button
                onClick={toggleCollapsed}
                className="hidden md:flex p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-input-bg transition-colors shrink-0"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
            {isAdminRole && adminCompanyName && (
              <p className="mt-2 text-[11px] text-text-muted truncate uppercase tracking-wider font-medium" title={adminCompanyName}>
                {t("sidebar.designedFor")} {adminCompanyName}
              </p>
            )}
          </>
        )}
      </div>

      {/* Company banner + selector (SUPER_ADMIN) o banner con avatar (ADMIN) */}
      {!collapsed && (
        <>
          {superAdmin ? (
            <div className="border-b border-card-border">
              <div className="relative overflow-hidden w-full aspect-[4/1] min-h-[7rem]">
                <img
                  src={effectiveBannerSrc}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/5 via-transparent to-black/10" aria-hidden />
                <p className={`absolute top-0 left-0 z-10 px-4 pt-3 text-[10px] font-semibold uppercase tracking-widest drop-shadow-sm ${bannerVariant ? "text-white/95" : "text-slate-900"}`}>
                  {t("sidebar.company")}
                </p>
                <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-3 pt-6 bg-gradient-to-t from-black/20 to-transparent">
                  <CompanySelector
                    companies={companies}
                    selectedCompanyId={selectedCompanyId}
                    selectedCompanyName={selectedCompanyName}
                    onSelect={handleSelectCompany}
                    placeholder={t("sidebar.selectCompany")}
                    allCompaniesLabel={t("sidebar.allCompanies")}
                    emptyLabel={t("companies.noCompanies")}
                    isDark={bannerVariant}
                    logoImageUrl={companyBranding?.logoImageUrl}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="border-b border-card-border">
              <div className="relative overflow-hidden w-full aspect-[4/1] min-h-[7rem]">
                <img
                  src={effectiveBannerSrc}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/5 via-transparent to-black/10" aria-hidden />
                <p className={`absolute top-0 left-0 z-10 px-4 pt-3 text-[10px] font-semibold uppercase tracking-widest drop-shadow-sm ${bannerVariant ? "text-white/95" : "text-slate-900"}`}>
                  {t("sidebar.company")}
                </p>
                <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-3 px-4 pb-3 pt-6 bg-gradient-to-t from-black/20 to-transparent">
                  <div className="w-9 h-9 rounded-full shrink-0 border border-white/30 overflow-hidden bg-input-bg flex items-center justify-center">
                    {companyBranding?.logoImageUrl?.trim() ? (
                      <img
                        src={companyBranding.logoImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="w-full h-full flex items-center justify-center text-xs font-semibold text-white"
                        style={{
                          backgroundColor: getAvatarColor(selectedCompanyId) ?? "rgba(0,0,0,0.4)",
                          color: "white",
                        }}
                      >
                        {(() => {
                          const name = adminCompanyName || "";
                          const parts = name.trim().split(/\s+/);
                          if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
                          if (name.length >= 2) return name.slice(0, 2).toUpperCase();
                          if (name.length === 1) return name[0].toUpperCase();
                          return "?";
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium text-sm truncate leading-tight drop-shadow-sm ${bannerVariant ? "text-white" : "text-slate-900"}`}>
                      {adminCompanyName || t("companies.single") || "Company"}
                    </p>
                    <p className={`text-xs truncate leading-tight mt-0.5 drop-shadow-sm ${bannerVariant ? "text-white/85" : "text-slate-700"}`}>
                      {adminCompanyEmail || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-company-tertiary">
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
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-company-primary transition-all duration-200 ${
                        isActive ? "opacity-100 h-6" : "opacity-0 h-0"
                      }`}
                    />
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-all duration-200">
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? "text-company-primary" : "text-company-tertiary group-hover:text-company-secondary"
                        }`}
                      />
                    </span>
                    {!collapsed && (
                      <>
                        <span
                          className={`font-medium truncate ${
                            isActive ? "text-text-primary" : "text-company-tertiary group-hover:text-company-secondary"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.href === "/dashboard/notifications" && unreadNotificationsCount > 0 && (
                          <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold shrink-0 ml-auto">
                            {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                          </span>
                        )}
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-company-primary shrink-0 ml-auto" />
                        )}
                      </>
                    )}
                    {collapsed && item.href === "/dashboard/notifications" && unreadNotificationsCount > 0 && (
                      <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-page"
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
                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          collapsed ? "justify-center" : ""
                        } ${
                          isActive
                            ? "bg-company-primary-subtle text-text-primary"
                            : "text-text-muted hover:bg-input-bg hover:text-text-secondary"
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

      {/* User + logout */}
      <div className="px-3 pb-3 pt-2 border-t border-card-border shrink-0">
        {/* User info — link a perfil */}
        <SidebarTooltip show={collapsed} label={t("sidebar.profile")}>
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-xl text-text-primary hover:bg-input-bg transition-colors min-w-0 w-full ${
              collapsed ? "justify-center flex-col gap-1" : ""
            }`}
          >
            <div className={`flex items-center gap-3 min-w-0 ${!collapsed ? "flex-1" : ""}`}>
              <div className="w-9 h-9 rounded-full shrink-0 border border-card-border overflow-hidden bg-input-bg flex items-center justify-center">
                {(user?.avatarUrl ?? user?.avatar)?.trim() ? (
                  <img
                    src={user.avatarUrl ?? user.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="w-full h-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{
                      backgroundColor: getAvatarColor(user?.id) ?? "var(--input-bg)",
                      color: getAvatarColor(user?.id) ? "white" : "var(--text-muted)",
                    }}
                  >
                    {user?.id ? getInitials(user) : "?"}
                  </span>
                )}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary text-sm truncate leading-tight">{getFullName(user)}</p>
                  <p className="text-text-muted text-xs truncate leading-tight mt-0.5">{user?.email}</p>
                </div>
              )}
            </div>
          </Link>
        </SidebarTooltip>

        {/* Logout */}
        <SidebarTooltip show={collapsed} label={t("auth.signOut")}>
          <button
            onClick={handleLogout}
            className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0">
              <LogOut className="w-[18px] h-[18px] transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
            {!collapsed && (
              <span className="text-sm font-medium truncate">{t("auth.signOut")}</span>
            )}
          </button>
        </SidebarTooltip>
      </div>
    </aside>
    </>
  );
}


