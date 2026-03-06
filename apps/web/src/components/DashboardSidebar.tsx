"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore, useDashboardStore, SIDEBAR_COLLAPSED_KEY } from "@/lib/store";
import { getFullName, isSuperAdmin } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import {
  LogOut,
  Home,
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
  Plus,
} from "lucide-react";

const SELECTED_COMPANY_KEY = "parkit_selected_company_id";
const SELECTED_COMPANY_NAME_KEY = "parkit_selected_company_name";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { selectedCompanyId, selectedCompanyName, setSelectedCompany, sidebarCollapsed: collapsed, setSidebarCollapsed } = useDashboardStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; commercialName?: string; legalName?: string }[]>([]);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
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
  }, [superAdmin]);

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
    router.push("/login");
  };

  const handleSelectCompany = (id: string, name: string) => {
    setSelectedCompany(id, name);
    setCompanyDropdownOpen(false);
  };

  const navGroups = useMemo(
    () => [
      {
        label: t("sidebar.main"),
        items: [
          { label: t("sidebar.overview"), href: "/dashboard", icon: Home },
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
    <aside
      className={`relative z-30 min-h-screen flex flex-col bg-page backdrop-blur-xl border-r border-card-border transition-[width] duration-300 ease-out shrink-0 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
      style={{ boxShadow: "4px 0 24px -4px rgba(0,0,0,0.1)" }}
    >
      {/* Logo / brand */}
      <div
        className={`flex flex-col border-b border-card-border shrink-0 ${
          collapsed ? "items-center justify-center py-3 px-2" : "px-4 pt-4 pb-3"
        }`}
      >
        {collapsed ? (
          <button
            onClick={toggleCollapsed}
            className="p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-input-bg transition-colors"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <Link href="/dashboard" className="flex items-center min-w-0 overflow-hidden">
                <Logo variant={isDark ? "onDark" : "default"} className="text-3xl truncate" />
              </Link>
              <button
                onClick={toggleCollapsed}
                className="p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-input-bg transition-colors shrink-0"
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
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setCompanyDropdownOpen((o) => !o)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-input-bg border border-input-border text-left text-sm text-text-secondary hover:bg-card transition-colors"
              >
                <Building2 className="w-4 h-4 text-text-muted shrink-0" />
                <span className="truncate flex-1">
                  {selectedCompanyName || t("sidebar.selectCompany")}
                </span>
                <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
              </button>
            {companyDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-[90]"
                  aria-hidden
                  onClick={() => setCompanyDropdownOpen(false)}
                />
                <ul className="absolute left-0 right-0 top-full mt-1 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl max-h-48 overflow-y-auto z-[100]">
                  {companies.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectCompany(
                            c.id,
                            c.commercialName || c.legalName || c.id
                          )
                        }
                        className={`w-full px-3 py-2.5 text-left text-sm truncate transition-colors ${
                          selectedCompanyId === c.id
                            ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {c.commercialName || c.legalName || c.id}
                      </button>
                    </li>
                  ))}
                  {companies.length === 0 && (
                    <li className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                      {t("companies.noCompanies")}
                    </li>
                  )}
                  <li className="border-t border-slate-200 dark:border-slate-700 mt-1 pt-1">
                    <Link
                      href="/dashboard/companies"
                      onClick={() => setCompanyDropdownOpen(false)}
                      className="block w-full px-3 py-2.5 text-left text-sm text-sky-600 dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {t("sidebar.allCompanies")}
                    </Link>
                  </li>
                </ul>
              </>
            )}
            </div>
            <Link
              href="/dashboard/companies/new"
              className="p-2.5 rounded-xl bg-input-bg border border-input-border text-text-muted hover:bg-card hover:text-sky-500 dark:hover:text-sky-400 transition-colors shrink-0"
              title={t("sidebar.addCompany")}
              aria-label={t("sidebar.addCompany")}
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>
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
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
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
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-card-border space-y-2 shrink-0">
        <div
          className={`flex items-center gap-3 rounded-xl p-2.5 ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? getFullName(user) || undefined : undefined}
        >
          <div className="flex items-center justify-center text-text-muted shrink-0">
            <CircleUserRound className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="font-medium text-text-primary text-sm truncate">{getFullName(user)}</p>
              <p className="text-text-muted text-xs truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={collapsed ? t("auth.signOut") : undefined}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 border border-input-border text-text-muted hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-200 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">{t("auth.signOut")}</span>}
        </button>
      </div>
    </aside>
  );
}


