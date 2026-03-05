"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { getFullName } from "@/lib/auth";
import { LogOut, Home, Users, Car, MapPin, Ticket, Bell } from "lucide-react";

export function DashboardSidebar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: Home },
    { label: "Companies", href: "/dashboard/companies", icon: Users },
    { label: "Users", href: "/dashboard/users", icon: Users },
    { label: "Vehicles", href: "/dashboard/vehicles", icon: Car },
    { label: "Parkings", href: "/dashboard/parkings", icon: MapPin },
    { label: "Bookings", href: "/dashboard/bookings", icon: Ticket },
    { label: "Tickets", href: "/dashboard/tickets", icon: Ticket },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  ];

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen flex flex-col shadow-xl">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold">Parkit</h2>
        <p className="text-sm text-gray-400">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-800 space-y-4">
        <div className="text-sm">
          <p className="font-medium">{getFullName(user)}</p>
          <p className="text-gray-400 text-xs">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
