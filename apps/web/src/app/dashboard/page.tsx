"use client";

import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Users, MapPin, Ticket } from "lucide-react";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container-narrow py-12">
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <StatCard
                title="Total Companies"
                value="12"
                icon={<Users className="w-8 h-8 text-blue-500" />}
                trend="+2.5%"
              />
              <StatCard
                title="Active Parkings"
                value="48"
                icon={<MapPin className="w-8 h-8 text-green-500" />}
                trend="+5.3%"
              />
              <StatCard
                title="Total Tickets"
                value="1,524"
                icon={<Ticket className="w-8 h-8 text-purple-500" />}
                trend="+12.1%"
              />
              <StatCard
                title="System Users"
                value="287"
                icon={<Users className="w-8 h-8 text-orange-500" />}
                trend="+8.2%"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-3">
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

              <div className="card">
                <h2 className="text-xl font-semibold mb-4">System Health</h2>
                <div className="space-y-4">
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
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-green-600 text-xs mt-2">{trend}</p>
        </div>
        <div>{icon}</div>
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
    <div className="border-b pb-3 last:border-b-0">
      <p className="font-medium text-sm">{title}</p>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
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
  const statusColors = {
    healthy: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
      <span className="text-sm font-medium">{label}</span>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
}
