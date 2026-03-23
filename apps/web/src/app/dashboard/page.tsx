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
  Ticket,
  CalendarCheck,
  Users,
  UserRound,
  TrendingUp,
  Car,
  ChevronRight,
} from "lucide-react";
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
  }, [query, selectedCompanyId]);

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
            icon: <CalendarCheck className="w-6 h-6" />,
            color: "amber",
          },
        ]
      : []),
    {
      key: "tickets",
      title: t("sidebar.tickets"),
      value: stats.ticketsCount,
      icon: <Ticket className="w-6 h-6" />,
      color: "violet",
    },
    {
      key: "valets",
      title: t("sidebar.valets"),
      value: stats.valetsCount,
      icon: <UserRound className="w-6 h-6" />,
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

  const colorClasses: Record<string, { bg: string; text: string; gradient: string }> = {
    sky: {
      bg: "bg-company-primary-subtle",
      text: "text-company-primary",
      gradient: "from-company-primary-20 to-transparent",
    },
    emerald: {
      bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
      text: "text-emerald-600 dark:text-emerald-400",
      gradient: "from-emerald-500/20 to-transparent",
    },
    violet: {
      bg: "bg-violet-500/10 dark:bg-violet-400/10",
      text: "text-violet-600 dark:text-violet-400",
      gradient: "from-violet-500/20 to-transparent",
    },
    amber: {
      bg: "bg-amber-500/10 dark:bg-amber-400/10",
      text: "text-amber-600 dark:text-amber-400",
      gradient: "from-amber-500/20 to-transparent",
    },
    rose: {
      bg: "bg-rose-500/10 dark:bg-rose-400/10",
      text: "text-rose-600 dark:text-rose-400",
      gradient: "from-rose-500/20 to-transparent",
    },
    cyan: {
      bg: "bg-cyan-500/10 dark:bg-cyan-400/10",
      text: "text-cyan-600 dark:text-cyan-400",
      gradient: "from-cyan-500/20 to-transparent",
    },
    teal: {
      bg: "bg-teal-500/10 dark:bg-teal-400/10",
      text: "text-teal-600 dark:text-teal-400",
      gradient: "from-teal-500/20 to-transparent",
    },
  };
  const defaultCardStyle: { bg: string; text: string; gradient: string } = {
    bg: "bg-company-primary-subtle",
    text: "text-sky-600 dark:text-sky-400",
    gradient: "from-sky-500/20 to-transparent",
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
            {/* Banner: gradient based on theme color, dark background for strong text legibility */}
            <header
              className="relative overflow-hidden rounded-2xl border border-white/15 p-6 md:p-8"
              style={{
                background: `linear-gradient(to bottom right, color-mix(in srgb, var(--company-primary, #2563eb) 55%, black), color-mix(in srgb, var(--company-primary, #2563eb) 30%, black), color-mix(in srgb, var(--company-primary, #2563eb) 12%, black))`,
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.08),transparent)]" />
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/15 p-2.5 shrink-0 text-white">
                      <TrendingUp className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white tracking-tight">
                        {t("dashboard.activityOverviewTitle")}
                      </p>
                      <p className="text-sm mt-0.5 text-white/90">
                        {stats.ticketsLast7Days.reduce((a, b) => a + b.count, 0)} {t("dashboard.ticketsThisWeek")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-3 border-t border-white/15">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 shrink-0 text-white/90" />
                    <span className="text-sm text-white/90">
                      {t("dashboard.avgPerDay")}:{" "}
                      <strong className="text-white font-semibold tabular-nums">
                        {avgPerDay.toFixed(avgPerDay >= 10 ? 0 : 1)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 shrink-0 text-white/90" />
                    <span className="text-sm text-white/90">
                      {t("dashboard.peakDay")}:{" "}
                      <strong className="text-white font-semibold tabular-nums">
                        {peakDay.count.toLocaleString()}
                      </strong>{" "}
                      <span className="text-white/80">({peakDayLabel})</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 shrink-0 text-white/90" />
                    <span className="text-sm text-white/90">
                      {t("dashboard.today")}:{" "}
                      <strong className="text-white font-semibold tabular-nums">
                        {todayCount.toLocaleString()}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 shrink-0 text-white/90" />
                    <span className="text-sm text-white/90">
                      {t("dashboard.lastActivity")}:{" "}
                      <strong className="text-white font-semibold">
                        {lastActivity}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Stat cards: ocupan todo el row tanto con bookings como sin ellos */}
            <section className="w-full">
              <div className="flex flex-wrap gap-4">
                {statCards.map((card) => {
                  const c = colorClasses[card.color] ?? defaultCardStyle;
                  return (
                    <div
                      key={card.key}
                      className="group relative flex-1 min-w-[160px] rounded-2xl border border-card-border bg-card p-5 backdrop-blur-sm transition-all duration-200 hover:border-company-primary-muted hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-text-secondary text-sm font-medium truncate">
                            {card.title}
                          </p>
                          <p className="text-2xl font-bold text-text-primary mt-1 tabular-nums">
                            {card.value.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`rounded-xl p-2.5 shrink-0 ${c.bg} ${c.text} transition-transform group-hover:scale-110`}
                        >
                          {card.icon}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Chart + Recent tickets */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
              <div className="lg:col-span-2 rounded-2xl border border-card-border bg-card p-6 backdrop-blur-sm overflow-hidden flex flex-col min-h-[320px]">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h2 className="text-lg font-semibold text-text-primary">
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
                <div className="flex-1 min-h-[240px]">
                  <DashboardTicketsChart
                    data={chartData}
                    ticketsLabel={t("dashboard.ticketsLabel")}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-card-border bg-card backdrop-blur-sm overflow-hidden flex flex-col min-h-0">
                <div className="p-4 border-b border-card-border flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">
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
