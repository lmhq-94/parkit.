"use client";

import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleToggle } from "@/components/LocaleToggle";
import { useTranslation } from "@/hooks/useTranslation";

const PATH_HEADERS: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "dashboard.title", description: "dashboard.summary" },
  "/dashboard/settings": { title: "settings.title", description: "settings.description" },
  "/dashboard/users": { title: "tables.employees.title", description: "tables.employees.description" },
  "/dashboard/valets": { title: "tables.valets.title", description: "tables.valets.description" },
  "/dashboard/vehicles": { title: "tables.vehicles.title", description: "tables.vehicles.description" },
  "/dashboard/parkings": { title: "tables.parkings.title", description: "tables.parkings.description" },
  "/dashboard/bookings": { title: "tables.bookings.title", description: "tables.bookings.description" },
  "/dashboard/tickets": { title: "tables.tickets.title", description: "tables.tickets.description" },
  "/dashboard/notifications": { title: "tables.notifications.title", description: "tables.notifications.description" },
  "/dashboard/companies": { title: "tables.companies.title", description: "tables.companies.description" },
};

function getHeaderForPath(pathname: string) {
  return PATH_HEADERS[pathname] ?? PATH_HEADERS["/dashboard"];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { title, description } = getHeaderForPath(pathname ?? "");

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-page">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col min-h-0">
          <header className="shrink-0 flex flex-wrap items-start justify-between gap-6 pl-12 pr-6 pt-8 pb-0 bg-card/50 backdrop-blur-sm">
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight truncate drop-shadow-sm">
                {t(title)}
              </h1>
              <p className="text-text-secondary text-base mt-2 font-medium max-w-2xl truncate opacity-90">
                {t(description)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <LocaleToggle />
            </div>
          </header>
          <div className="flex-1 flex flex-col overflow-auto min-h-0">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
