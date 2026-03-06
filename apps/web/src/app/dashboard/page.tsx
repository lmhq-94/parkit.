"use client";

import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useTranslation } from "@/hooks/useTranslation";
import { Users, MapPin, Ticket } from "lucide-react";

export default function DashboardPage() {
  const { t } = useTranslation();
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-page">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto">
            <h1 className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight mb-2">
              {t("dashboard.title")}
            </h1>
            <p className="text-text-secondary text-sm mb-10">
              {t("dashboard.summary")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <StatCard
                title={t("dashboard.totalCompanies")}
                value="12"
                icon={<Users className="w-7 h-7 text-sky-500 dark:text-sky-400" />}
                trend="+2.5%"
              />
              <StatCard
                title={t("dashboard.activeParkings")}
                value="48"
                icon={<MapPin className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />}
                trend="+5.3%"
              />
              <StatCard
                title={t("dashboard.totalTickets")}
                value="1,524"
                icon={<Ticket className="w-7 h-7 text-violet-500 dark:text-violet-400" />}
                trend="+12.1%"
              />
              <StatCard
                title={t("dashboard.systemUsers")}
                value="287"
                icon={<Users className="w-7 h-7 text-amber-500 dark:text-amber-400" />}
                trend="+8.2%"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-card-border bg-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-text-primary mb-4">{t("dashboard.recentActivity")}</h2>
                <div className="space-y-4">
                  <ActivityItem
                    title="New booking created"
                    time="2 minutes ago"
                    user="John Doe"
                  />
                  <ActivityItem
                    title="Valet status updated"
                    time="15 minutes ago"
                    user="Jane Smith"
                  />
                  <ActivityItem
                    title="Ticket completed"
                    time="1 hour ago"
                    user="Admin User"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-card-border bg-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-text-primary mb-4">{t("dashboard.systemHealth")}</h2>
                <div className="space-y-3">
                  <HealthIndicator label="API Server" status="healthy" />
                  <HealthIndicator label="Database" status="healthy" />
                  <HealthIndicator label="Cache" status="healthy" />
                  <HealthIndicator label="Notifications" status="warning" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-5 backdrop-blur-sm transition-colors hover:bg-input-bg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          <p className="text-emerald-500/90 dark:text-emerald-400/90 text-xs font-medium mt-2">{trend}</p>
        </div>
        <div className="rounded-xl bg-input-bg p-2.5">{icon}</div>
      </div>
    </div>
  );
}

function ActivityItem({
  title,
  time,
  user,
}: {
  title: string;
  time: string;
  user: string;
}) {
  return (
    <div className="border-b border-card-border pb-3 last:border-b-0 last:pb-0">
      <p className="font-medium text-sm text-text-primary">{title}</p>
      <div className="flex justify-between text-xs text-text-muted mt-1">
        <span>{user}</span>
        <span>{time}</span>
      </div>
    </div>
  );
}

function HealthIndicator({
  label,
  status,
}: {
  label: string;
  status: "healthy" | "warning" | "error";
}) {
  const styles = {
    healthy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    error: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-input-bg border border-card-border">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
}
