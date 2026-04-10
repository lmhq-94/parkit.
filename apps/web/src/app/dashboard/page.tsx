"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { getStoredUser, isSuperAdmin } from "@/lib/auth";
import { useDashboardStore } from "@/lib/store";
import { useToast } from "@/lib/toastStore";
import { apiClient } from "@/lib/api";
import { formatPlate } from "@/lib/inputMasks";
import {
  ArrowLeft,
  MapPin,
  TicketCheck,
  Calendar,
  Users,
  User,
  TrendingUp,
  Car,
  ChevronRight,
} from "@/lib/premiumIcons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { DatePickerField } from "@/components/DatePickerField";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageLoader } from "@/components/PageLoader";

const DashboardTicketsChart = dynamic(
  () =>
    import("@/components/DashboardTicketsChart").then((m) => m.DashboardTicketsChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 min-h-[240px] flex items-center justify-center bg-input-bg/50 rounded-lg animate-pulse" />
    ),
  }
);

interface DashboardStats {
  companiesCount: number;
  parkingsCount: number;
  vehiclesCount: number;
  valetsCount: number;
  customersCount: number;
  ticketsCount: number;
  usersCount: number;
  bookingsCount: number;
  hasParkingWithBooking?: boolean;
  ticketsLast7Days: { date: string; count: number }[];
  recentTickets: Array<{
    id: string;
    status: string;
    entryTime: string | null;
    parking?: { name: string };
    vehicle?: { plate: string; brand: string; model: string };
  }>;
}

function formatShortDate(dateStr: string, locale: string) {
  // Interpret YYYY-MM-DD as calendar date (without converting to local time) so label matches data day
  const [yStr, mStr, dStr] = dateStr.split("-");
  const y = Number(yStr ?? 0);
  const m = Number(mStr ?? 1);
  const d = Number(dStr ?? 1);
  const d2 = new Date(y, (m || 1) - 1, d || 1);
  return d2.toLocaleDateString(locale === "es" ? "es" : "en", {
    day: "2-digit",
    month: "short",
  });
}

function formatRelativeTime(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const rtf = new Intl.RelativeTimeFormat(locale === "es" ? "es" : "en", { numeric: "auto" });
  if (diffMins < 1) return rtf.format(0, "minute");
  if (diffMins < 60) return rtf.format(-diffMins, "minute");
  if (diffHours < 24) return rtf.format(-diffHours, "hour");
  if (diffDays < 7) return rtf.format(-diffDays, "day");
  return d.toLocaleDateString(locale === "es" ? "es" : "en");
}

const RANGE_OPTIONS = [7, 14, 30] as const;
type RangeDays = (typeof RANGE_OPTIONS)[number];

function toYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Máximo de días permitidos en el rango (igual que en la API). */
const MAX_RANGE_DAYS = 90;

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return toYYYYMMDD(d);
}

function getDefaultCustomRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 6);
  return { from: toYYYYMMDD(from), to: toYYYYMMDD(now) };
}

/** Ajusta from/to para que el rango no supere MAX_RANGE_DAYS. */
function clampRange(from: string, to: string): { from: string; to: string } {
  const fromDate = new Date(from + "T12:00:00").getTime();
  const toDate = new Date(to + "T12:00:00").getTime();
  const days = Math.round((toDate - fromDate) / 86400000) + 1;
  if (days <= MAX_RANGE_DAYS) return { from, to };
  const maxTo = addDays(from, MAX_RANGE_DAYS - 1);
  return { from, to: maxTo };
}

export default function DashboardPage() {
  const { t, tEnum, locale } = useTranslation();
  const router = useRouter();
  const { showError: showToastError } = useToast();
  const selectedCompanyId = useDashboardStore((s: { selectedCompanyId: string | null }) => s.selectedCompanyId);
  const user = getStoredUser();
  const superAdmin = isSuperAdmin(user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<RangeDays>(7);
  const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null);
  const [customRangeJustOpened, setCustomRangeJustOpened] = useState(false);
  const [redirectingNoCompanies, setRedirectingNoCompanies] = useState(false);

  const query = customRange
    ? `from=${encodeURIComponent(customRange.from)}&to=${encodeURIComponent(customRange.to)}`
    : `days=${days}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const data = await apiClient.get<DashboardStats>(`/dashboard/stats?${query}`);
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Error loading dashboard";
          setError(msg);
          showToastError(t("common.loadError"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, selectedCompanyId, showToastError, t]);

  // After opening custom range for the first time, reset the flag
  useEffect(() => {
    if (customRangeJustOpened) {
      const id = window.setTimeout(() => setCustomRangeJustOpened(false), 0);
      return () => window.clearTimeout(id);
    }
  }, [customRangeJustOpened]);

  // Redirect to "no companies" only for SUPER_ADMIN without selected company and with none in system.
  // With selected company, stats are scoped to that company and companiesCount is 0; do not redirect.
  useEffect(() => {
    if (
      superAdmin &&
      !selectedCompanyId &&
      stats &&
      stats.companiesCount === 0 &&
      !redirectingNoCompanies
    ) {
      setRedirectingNoCompanies(true);
      router.replace("/dashboard/no-companies");
    }
  }, [superAdmin, selectedCompanyId, stats, redirectingNoCompanies, router]);

  // Full spinner only on initial load (no data). When changing days, keep UI and only refresh data.
  if (loading && !stats) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <PageLoader />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center max-w-md">
          <p className="text-red-500 dark:text-red-400 font-medium">{error ?? "Error"}</p>
          <p className="text-text-muted text-sm mt-2">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (redirectingNoCompanies) {
    return null;
  }

  // Same order as sidebar: Main (parkings, bookings, tickets) -> Team (valets) -> Clients (customers, vehicles)
  const statCards: Array<{
    key: string;
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      key: "parkings",
      title: t("sidebar.parkings"),
      value: stats.parkingsCount,
      icon: <MapPin className="w-6 h-6" />,
      color: "emerald",
    },
    ...(stats.hasParkingWithBooking
      ? [
          {
            key: "bookings",
            title: t("sidebar.bookings"),
            value: stats.bookingsCount,
            icon: <Calendar className="w-6 h-6" />,
            color: "amber",
          },
        ]
      : []),
    {
      key: "tickets",
      title: t("sidebar.tickets"),
      value: stats.ticketsCount,
      icon: <TicketCheck className="w-6 h-6" />,
      color: "violet",
    },
    {
      key: "valets",
      title: t("sidebar.valets"),
      value: stats.valetsCount,
      icon: <User className="w-6 h-6" />,
      color: "cyan",
    },
    {
      key: "customers",
      title: t("sidebar.customers"),
      value: stats.customersCount,
      icon: <Users className="w-6 h-6" />,
      color: "rose",
    },
    {
      key: "vehicles",
      title: t("sidebar.vehicles"),
      value: stats.vehiclesCount,
      icon: <Car className="w-6 h-6" />,
      color: "teal",
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; glow: string; ring: string }> = {
    sky: {
      bg: "bg-gradient-to-br from-company-primary/15 to-company-primary/5",
      text: "text-company-primary",
      glow: "shadow-company-primary/20",
      ring: "ring-company-primary/20",
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 dark:from-emerald-400/15 dark:to-emerald-400/5",
      text: "text-emerald-600 dark:text-emerald-400",
      glow: "shadow-emerald-500/20 dark:shadow-emerald-400/20",
      ring: "ring-emerald-500/20 dark:ring-emerald-400/20",
    },
    violet: {
      bg: "bg-gradient-to-br from-violet-500/15 to-violet-500/5 dark:from-violet-400/15 dark:to-violet-400/5",
      text: "text-violet-600 dark:text-violet-400",
      glow: "shadow-violet-500/20 dark:shadow-violet-400/20",
      ring: "ring-violet-500/20 dark:ring-violet-400/20",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-500/15 to-amber-500/5 dark:from-amber-400/15 dark:to-amber-400/5",
      text: "text-amber-600 dark:text-amber-400",
      glow: "shadow-amber-500/20 dark:shadow-amber-400/20",
      ring: "ring-amber-500/20 dark:ring-amber-400/20",
    },
    rose: {
      bg: "bg-gradient-to-br from-rose-500/15 to-rose-500/5 dark:from-rose-400/15 dark:to-rose-400/5",
      text: "text-rose-600 dark:text-rose-400",
      glow: "shadow-rose-500/20 dark:shadow-rose-400/20",
      ring: "ring-rose-500/20 dark:ring-rose-400/20",
    },
    cyan: {
      bg: "bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 dark:from-cyan-400/15 dark:to-cyan-400/5",
      text: "text-cyan-600 dark:text-cyan-400",
      glow: "shadow-cyan-500/20 dark:shadow-cyan-400/20",
      ring: "ring-cyan-500/20 dark:ring-cyan-400/20",
    },
    teal: {
      bg: "bg-gradient-to-br from-teal-500/15 to-teal-500/5 dark:from-teal-400/15 dark:to-teal-400/5",
      text: "text-teal-600 dark:text-teal-400",
      glow: "shadow-teal-500/20 dark:shadow-teal-400/20",
      ring: "ring-teal-500/20 dark:ring-teal-400/20",
    },
  };
  const defaultCardStyle = {
    bg: "bg-gradient-to-br from-sky-500/15 to-sky-500/5 dark:from-sky-400/15 dark:to-sky-400/5",
    text: "text-sky-600 dark:text-sky-400",
    glow: "shadow-sky-500/20 dark:shadow-sky-400/20",
    ring: "ring-sky-500/20 dark:ring-sky-400/20",
  };

  const chartData = stats.ticketsLast7Days.map((d) => ({
    ...d,
    label: formatShortDate(d.date, locale),
  }));

  const ticketsLast7Total = stats.ticketsLast7Days.reduce((a, b) => a + b.count, 0);
  const daysCount = Math.max(stats.ticketsLast7Days.length, 1);
  const avgPerDay = ticketsLast7Total / daysCount;
  const peakDay = stats.ticketsLast7Days.reduce(
    (best, cur) => (cur.count > best.count ? cur : best),
    stats.ticketsLast7Days[0] ?? { date: "", count: 0 }
  );
  const peakDayLabel = peakDay.date ? formatShortDate(peakDay.date, locale) : "—";
  const todayCount = stats.ticketsLast7Days.at(-1)?.count ?? 0;
  const lastActivity = stats.recentTickets[0]?.entryTime
    ? formatRelativeTime(stats.recentTickets[0].entryTime, locale)
    : "—";

  return (
    <div className="pt-4 md:pt-6 px-4 md:px-10 lg:px-12 pb-4 md:pb-10 lg:pb-12 w-full flex-1 flex flex-col gap-6 md:gap-8">
            {/* Premium Banner with glassmorphism and refined gradients */}
            <header
              className="relative overflow-hidden rounded-3xl border border-white/20 p-6 md:p-8 shadow-2xl shadow-black/10"
              style={{
                background: `
                  linear-gradient(135deg, 
                    color-mix(in srgb, var(--company-primary, #2563eb) 60%, black) 0%,
                    color-mix(in srgb, var(--company-primary, #2563eb) 35%, black) 50%,
                    color-mix(in srgb, var(--company-primary, #2563eb) 18%, black) 100%
                  )
                `,
              }}
            >
              {/* Premium ambient glow effects */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(255,255,255,0.12),transparent)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.1)_100%)]" />

              <div className="relative space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shrink-0 text-white shadow-lg">
                      <TrendingUp className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white tracking-tight drop-shadow-sm">
                        {t("dashboard.activityOverviewTitle")}
                      </p>
                      <p className="text-sm mt-1 text-white/90 font-medium tracking-wide">
                        {stats.ticketsLast7Days.reduce((a, b) => a + b.count, 0)} {t("dashboard.ticketsThisWeek")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 border-t border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-white/10 p-1.5">
                      <Calendar className="w-4 h-4 shrink-0 text-white/90" />
                    </div>
                    <span className="text-sm text-white/80">
                      {t("dashboard.avgPerDay")}
                      <strong className="text-white font-semibold tabular-nums ml-1.5">
                        {avgPerDay.toFixed(avgPerDay >= 10 ? 0 : 1)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-white/10 p-1.5">
                      <TrendingUp className="w-4 h-4 shrink-0 text-white/90" />
                    </div>
                    <span className="text-sm text-white/80">
                      {t("dashboard.peakDay")}
                      <strong className="text-white font-semibold tabular-nums ml-1.5">
                        {peakDay.count.toLocaleString()}
                      </strong>
                      <span className="text-white/60 ml-1">({peakDayLabel})</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-white/10 p-1.5">
                      <TicketCheck className="w-4 h-4 shrink-0 text-white/90" />
                    </div>
                    <span className="text-sm text-white/80">
                      {t("dashboard.today")}
                      <strong className="text-white font-semibold tabular-nums ml-1.5">
                        {todayCount.toLocaleString()}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-white/10 p-1.5">
                      <Users className="w-4 h-4 shrink-0 text-white/90" />
                    </div>
                    <span className="text-sm text-white/80">
                      {t("dashboard.lastActivity")}
                      <strong className="text-white font-semibold ml-1.5">
                        {lastActivity}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Premium Stat Cards with refined shadows and gradients */}
            <section className="w-full">
              <div className="flex flex-wrap gap-4">
                {statCards.map((card) => {
                  const c = colorClasses[card.color] ?? defaultCardStyle;
                  return (
                    <div
                      key={card.key}
                      className={`group relative flex-1 min-w-[160px] rounded-2xl border border-card-border bg-gradient-to-br from-card to-card/95 p-5 backdrop-blur-sm transition-all duration-300 ease-out hover:border-company-primary/30 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5`}
                    >
                      {/* Subtle glow effect on hover */}
                      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${c.bg} blur-xl -z-10`} />

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="premium-label text-slate-500 dark:text-slate-400">
                            {card.title}
                          </p>
                          <p className="text-2xl font-bold text-text-primary mt-1.5 tabular-nums tracking-tight">
                            {card.value.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`rounded-xl p-2.5 shrink-0 ${c.bg} ${c.text} transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-md ${c.glow}`}
                        >
                          {card.icon}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Chart + Recent tickets with premium styling */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
              <div className="lg:col-span-2 rounded-2xl border border-card-border bg-gradient-to-br from-card to-card/95 p-6 backdrop-blur-sm overflow-hidden flex flex-col min-h-[320px] shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h2 className="text-lg premium-section-title">
                    {t("dashboard.chartTicketsTitle")}
                  </h2>
                  <div className="flex items-center justify-end gap-3">
                    {customRange ? (
                      <div className="flex items-center gap-2 rounded-lg border border-input-border bg-input-bg p-0.5">
                        <button
                          type="button"
                          onClick={() => setCustomRange(null)}
                          disabled={loading}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-company-tertiary hover:bg-company-tertiary-subtle hover:text-text-primary border border-transparent transition-colors disabled:opacity-60"
                          aria-label={t("common.back")}
                        >
                          <ArrowLeft className="w-4 h-4 shrink-0" />
                          {t("common.back")}
                        </button>
                        <DatePickerField
                          value={customRange.from}
                          autoOpen={customRangeJustOpened}
                          compact
                          minDate={addDays(customRange.to, -MAX_RANGE_DAYS + 1)}
                          maxDate={customRange.to}
                          onChange={(v) => {
                            const nextFrom = v || customRange.from;
                            setCustomRange((r) =>
                              r ? clampRange(nextFrom, r.to) : r
                            );
                          }}
                          className="min-w-[11rem]"
                        />
                        <DatePickerField
                          value={customRange.to}
                          autoOpen={customRangeJustOpened}
                          compact
                          minDate={customRange.from}
                          maxDate={addDays(customRange.from, MAX_RANGE_DAYS - 1)}
                          onChange={(v) => {
                            const nextTo = v || customRange.to;
                            setCustomRange((r) =>
                              r ? clampRange(r.from, nextTo) : r
                            );
                          }}
                          className="min-w-[11rem]"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 rounded-lg border border-input-border bg-input-bg p-0.5">
                          {RANGE_OPTIONS.map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                setCustomRange(null);
                                setDays(d);
                              }}
                              disabled={loading}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-60 ${
                                days === d
                                  ? "bg-company-primary-subtle text-company-primary border border-company-primary-muted"
                                  : "text-company-tertiary hover:bg-company-tertiary-subtle hover:text-text-primary border border-transparent"
                              }`}
                            >
                              {t(d === 7 ? "dashboard.rangeLast7" : d === 14 ? "dashboard.rangeLast14" : "dashboard.rangeLast30")}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setCustomRange(getDefaultCustomRange());
                              setCustomRangeJustOpened(true);
                            }}
                            disabled={loading}
                            className="px-3 py-2 rounded-md text-sm font-medium text-company-tertiary hover:bg-company-tertiary-subtle hover:text-text-primary border border-transparent transition-colors disabled:opacity-60"
                          >
                            {t("dashboard.rangeCustom")}
                          </button>
                        </div>
                        {loading && (
                          <LoadingSpinner size="sm" className="shrink-0" aria-label="" />
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-h-[240px] w-full">
                  <DashboardTicketsChart
                    data={chartData}
                    ticketsLabel={t("dashboard.ticketsLabel")}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-card-border bg-gradient-to-br from-card to-card/95 backdrop-blur-sm overflow-hidden flex flex-col min-h-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="p-4 border-b border-card-border/80 flex items-center justify-between bg-gradient-to-r from-transparent via-card to-transparent">
                  <h2 className="text-lg premium-section-title">
                    {t("dashboard.recentTickets")}
                  </h2>
                  <Link
                    href="/dashboard/tickets"
                    className="text-sm font-medium text-company-primary hover:text-company-primary flex items-center gap-1"
                  >
                    {t("dashboard.viewAll")}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex-1 overflow-auto p-2">
                  {stats.recentTickets.length === 0 ? (
                    <p className="text-text-muted text-sm py-8 text-center">
                      {t("dashboard.noRecentActivity")}
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {stats.recentTickets.map((ticket) => {
                        const vehicleLabel = ticket.vehicle
                          ? [ticket.vehicle.brand, ticket.vehicle.model]
                              .filter(Boolean)
                              .join(" ")
                          : null;
                        const plate = ticket.vehicle?.plate ? formatPlate(ticket.vehicle.plate) : "—";
                        return (
                          <li key={ticket.id}>
                            <Link
                              href="/dashboard/tickets"
                              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-input-bg"
                            >
                              <div className="rounded-lg bg-company-primary-subtle p-2 text-company-primary">
                                <Car className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-text-primary truncate">
                                  {vehicleLabel ? `${vehicleLabel} (${plate})` : plate}
                                </p>
                                <p className="text-xs text-text-muted flex items-center gap-2">
                                  <span>{ticket.parking?.name ?? "—"}</span>
                                  <span>·</span>
                                  <span>
                                    {ticket.entryTime
                                      ? formatRelativeTime(ticket.entryTime, locale)
                                      : "—"}
                                  </span>
                                </p>
                              </div>
                              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-input-bg text-text-secondary shrink-0">
                                {tEnum("ticketStatus", ticket.status)}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </section>
    </div>
  );
}
