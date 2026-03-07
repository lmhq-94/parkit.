"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore, useDashboardStore, SIDEBAR_COLLAPSED_KEY } from "@/lib/store";
import { getFullName, isSuperAdmin } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import {
  LogOut,
  LayoutDashboard,
  Users,
  UserRound,
  CircleUserRound,
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

function CompanySelector({
  companies, selectedCompanyId, selectedCompanyName, onSelect, placeholder, allCompaniesLabel, emptyLabel,
}: {
  companies: { id: string; commercialName?: string; legalName?: string }[];
  selectedCompanyId: string | null;
  selectedCompanyName: string | null;
  onSelect: (id: string, name: string) => void;
  placeholder: string;
  allCompaniesLabel: string;
  emptyLabel: string;
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

  const dropdown = open && typeof document !== "undefined" && createPortal(
    <div
      data-company-dropdown
      className="fixed z-[99999] flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900 py-1.5 px-1.5"
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
                  ? "bg-sky-500/20 text-sky-600 dark:text-sky-400 font-medium"
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
          className="block w-full px-3 py-2 text-left text-sm text-sky-600 dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-lg"
        >
          {allCompaniesLabel}
        </Link>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10" />
        <button
          ref={triggerRef}
          type="button"
          onClick={() => { if (!open) updatePosition(); setOpen((o) => !o); }}
          className={`w-full flex items-center pl-9 pr-8 py-2.5 rounded-xl border text-left text-sm transition-colors ${
            open
              ? "bg-input-bg border-sky-500 ring-1 ring-sky-500 text-text-primary"
              : "bg-input-bg border-input-border text-text-secondary hover:border-sky-500/40"
          }`}
        >
          <span className="truncate flex-1">
            {selectedCompanyName || <span className="text-text-muted">{placeholder}</span>}
          </span>
        </button>
        <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform duration-200 ${open ? "rotate-180 text-sky-500" : "text-text-muted/50"}`} />
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
  const { selectedCompanyId, selectedCompanyName, setSelectedCompany, sidebarCollapsed: collapsed, setSidebarCollapsed, sidebarOpen, toggleSidebar, companiesVersion } = useDashboardStore();
  const [mounted, setMounted] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; commercialName?: string; legalName?: string }[]>([]);
  const [adminCompanyName, setAdminCompanyName] = useState<string | null>(null);

  const superAdmin = isSuperAdmin(user);
  const isAdminRole = user?.systemRole === "ADMIN";
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Para ADMIN: obtener nombre de la empresa (su company) para mostrarlo en el sidebar
  useEffect(() => {
    if (!mounted || !user || superAdmin) return;
    apiClient
      .get<{ commercialName?: string; legalName?: string }>("/companies/me")
      .then((company) => {
        const name = company?.commercialName || company?.legalName || null;
        setAdminCompanyName(name ?? null);
      })
      .catch(() => setAdminCompanyName(null));
  }, [mounted, user?.id, superAdmin]);

  const toggleCollapsed = () => setSidebarCollapsed(!collapsed);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleSelectCompany = (id: string, name: string) => {
    setSelectedCompany(id, name);
  };

  const navGroups = useMemo(
    () => [
      {
        label: t("sidebar.main"),
        items: [
          { label: t("sidebar.overview"), href: "/dashboard", icon: LayoutDashboard },
          { label: t("sidebar.employees"), href: "/dashboard/users", icon: Users },
          { label: t("sidebar.valets"), href: "/dashboard/valets", icon: UserRound },
          { label: t("sidebar.vehicles"), href: "/dashboard/vehicles", icon: Car },
          { label: t("sidebar.parkings"), href: "/dashboard/parkings", icon: MapPin },
          { label: t("sidebar.bookings"), href: "/dashboard/bookings", icon: CalendarCheck },
          { label: t("sidebar.tickets"), href: "/dashboard/tickets", icon: Ticket },
        ],
      },
      {
        label: t("sidebar.account"),
        items: [
          { label: t("sidebar.notifications"), href: "/dashboard/notifications", icon: Bell },
          { label: t("sidebar.settings"), href: "/dashboard/settings", icon: Settings },
        ],
      },
    ],
    [t]
  );

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

      {/* Company selector (SUPER_ADMIN only) */}
      {superAdmin && !collapsed && (
        <div className="px-3 pt-4 pb-2 border-b border-card-border">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            {t("sidebar.company")}
          </p>
          <CompanySelector
            companies={companies}
            selectedCompanyId={selectedCompanyId}
            selectedCompanyName={selectedCompanyName}
            onSelect={handleSelectCompany}
            placeholder={t("sidebar.selectCompany")}
            allCompaniesLabel={t("sidebar.allCompanies")}
            emptyLabel={t("companies.noCompanies")}
          />
        </div>
      )}

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
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
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-sky-500 dark:bg-sky-400 transition-all duration-200 ${
                        isActive ? "opacity-100 h-6" : "opacity-0 h-0"
                      }`}
                    />
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-all duration-200">
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? "text-sky-500 dark:text-sky-400" : "text-text-muted group-hover:text-text-secondary"
                        }`}
                      />
                    </span>
                    {!collapsed && (
                      <>
                        <span
                          className={`font-medium truncate ${
                            isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"
                          }`}
                        >
                          {item.label}
                        </span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-sky-500/80 dark:text-sky-400/80 shrink-0 ml-auto" />
                        )}
                      </>
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
                            ? "bg-sky-500/10 dark:bg-sky-500/10 text-text-primary"
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
        {/* User info */}
        <SidebarTooltip
          show={collapsed}
          label={getFullName(user) || user?.email || ""}
        >
          <div
            className={`flex items-center gap-3 px-3 py-2.5 mb-0.5 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-input-bg border border-card-border flex items-center justify-center shrink-0">
              <CircleUserRound className="w-[18px] h-[18px] text-text-muted" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary text-sm truncate leading-tight">{getFullName(user)}</p>
                <p className="text-text-muted text-xs truncate leading-tight mt-0.5">{user?.email}</p>
              </div>
            )}
          </div>
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


