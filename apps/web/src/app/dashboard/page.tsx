"use client";

import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useTranslation } from "@/hooks/useTranslation";
import { getStoredUser, isSuperAdmin } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import {
  Building2,
  MapPin,
  Ticket,
  CalendarCheck,
  Users,
  TrendingUp,
  Car,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  companiesCount: number;
  parkingsCount: number;
  vehiclesCount: number;
  ticketsCount: number;
  usersCount: number;
  bookingsCount: number;
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
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale === "es" ? "es" : "en", {
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

export default function DashboardPage() {
  const { t, tEnum, locale } = useTranslation();
  const user = getStoredUser();
  const superAdmin = isSuperAdmin(user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiClient.get<DashboardStats>("/dashboard/stats");
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error loading dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-page">
          <DashboardSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
              <p className="text-text-muted text-sm">{t("common.loading")}</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !stats) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-page">
          <DashboardSidebar />
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center max-w-md">
              <p className="text-red-500 dark:text-red-400 font-medium">{error ?? "Error"}</p>
              <p className="text-text-muted text-sm mt-2">{t("common.loading")}</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const isAdmin = user?.systemRole === "ADMIN";
  const statCards: Array<{
    key: string;
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = [
    ...(superAdmin
      ? [
          {
            key: "companies",
            title: t("dashboard.totalCompanies"),
            value: stats.companiesCount,
            icon: <Building2 className="w-6 h-6" />,
            color: "sky",
          },
        ]
      : []),
    {
      key: "users",
      title: t("dashboard.systemUsers"),
      value: stats.usersCount,
      icon: <Users className="w-6 h-6" />,
      color: "rose",
    },
    {
      key: "parkings",
      title: t("dashboard.activeParkings"),
      value: stats.parkingsCount,
      icon: <MapPin className="w-6 h-6" />,
      color: "emerald",
    },
    ...(isAdmin
      ? [
          {
            key: "vehicles",
            title: t("dashboard.vehicles"),
            value: stats.vehiclesCount,
            icon: <Car className="w-6 h-6" />,
            color: "cyan",
          },
        ]
      : []),
    {
      key: "tickets",
      title: t("dashboard.totalTickets"),
      value: stats.ticketsCount,
      icon: <Ticket className="w-6 h-6" />,
      color: "violet",
    },
    {
      key: "bookings",
      title: t("dashboard.totalBookings"),
      value: stats.bookingsCount,
      icon: <CalendarCheck className="w-6 h-6" />,
      color: "amber",
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; gradient: string }> = {
    sky: {
      bg: "bg-sky-500/10 dark:bg-sky-400/10",
      text: "text-sky-600 dark:text-sky-400",
      gradient: "from-sky-500/20 to-transparent",
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
  };
  const defaultCardStyle: { bg: string; text: string; gradient: string } = {
    bg: "bg-sky-500/10 dark:bg-sky-400/10",
    text: "text-sky-600 dark:text-sky-400",
    gradient: "from-sky-500/20 to-transparent",
  };

  const chartData = stats.ticketsLast7Days.map((d) => ({
    ...d,
    label: formatShortDate(d.date, locale),
  }));

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-page">
        <DashboardSidebar />
        <main className="flex-1 min-h-0 flex flex-col">
          <div className="p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto w-full flex-1 flex flex-col gap-8">
            {/* Header */}
            <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600/90 via-sky-700/80 to-slate-800 dark:from-sky-700/90 dark:via-sky-800/80 dark:to-slate-900 border border-sky-500/20 p-6 md:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(14,165,233,0.25),transparent)]" />
              <div className="relative">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {t("dashboard.title")}
                </h1>
                <p className="text-sky-100/90 text-sm md:text-base mt-1 max-w-xl">
                  {t("dashboard.summary")}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sky-200/80 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    {stats.ticketsLast7Days.reduce((a, b) => a + b.count, 0)} {t("dashboard.ticketsThisWeek")}
                  </span>
                </div>
              </div>
            </header>

            {/* Stat cards */}
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {statCards.map((card) => {
                  const c = colorClasses[card.color] ?? defaultCardStyle;
                  return (
                    <div
                      key={card.key}
                      className="group relative rounded-2xl border border-card-border bg-card p-5 backdrop-blur-sm transition-all duration-200 hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/5"
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
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  {t("dashboard.chartTicketsTitle")}
                </h2>
                <div className="flex-1 min-h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ticketsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--card-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                        axisLine={{ stroke: "var(--card-border)" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card-bg)",
                          border: "1px solid var(--card-border)",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                        labelStyle={{ color: "var(--text-primary)" }}
                        formatter={(value: number | undefined) => [
                          value ?? 0,
                          t("dashboard.ticketsLabel"),
                        ]}
                        labelFormatter={(label) => label}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="rgb(14, 165, 233)"
                        strokeWidth={2}
                        fill="url(#ticketsGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-card-border bg-card backdrop-blur-sm overflow-hidden flex flex-col min-h-0">
                <div className="p-4 border-b border-card-border flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">
                    {t("dashboard.recentTickets")}
                  </h2>
                  <Link
                    href="/dashboard/tickets"
                    className="text-sm font-medium text-sky-500 hover:text-sky-400 flex items-center gap-1"
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
                        const plate = ticket.vehicle?.plate ?? "—";
                        return (
                          <li key={ticket.id}>
                            <Link
                              href="/dashboard/tickets"
                              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-input-bg"
                            >
                              <div className="rounded-lg bg-violet-500/10 p-2 text-violet-600 dark:text-violet-400">
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
        </main>
      </div>
    </ProtectedRoute>
  );
}
