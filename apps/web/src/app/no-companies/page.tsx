"use client";

import { useEffect, useState } from "react";
import { Sparkles, Plus } from "@/lib/premiumIcons";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "next-themes";
import { getStoredUser, isSuperAdmin } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function NoCompaniesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = getStoredUser();
  const superAdmin = isSuperAdmin(user);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Only SUPER_ADMIN can view this page. ADMIN/STAFF belong to a company -> overview.
  useEffect(() => {
    if (user && !superAdmin) {
      router.replace("/dashboard");
    }
  }, [user, superAdmin, router]);

  // Set body background to transparent to show animated gradient
  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  if (user && !superAdmin) {
    return null;
  }

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">

      {/* Full screen animated gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a1a 100%)'
              : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0f2fe 75%, #f0f9ff 100%)',
          }}
        />

        {/* Blob shapes */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px]" style={{ background: isDark ? 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(60px)', opacity: isDark ? 0.6 : 0.7, animation: 'lava-morph-1 20s ease-in-out infinite' }} />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px]" style={{ background: isDark ? 'linear-gradient(225deg, #3730a3 0%, #4338ca 50%, #1e3a5f 100%)' : 'linear-gradient(225deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', filter: 'blur(50px)', opacity: isDark ? 0.5 : 0.65, animation: 'lava-morph-2 25s ease-in-out infinite' }} />
        <div className="absolute bottom-20 left-1/4 w-[450px] h-[450px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)' : 'linear-gradient(45deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)', borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%', filter: 'blur(70px)', opacity: isDark ? 0.55 : 0.75, animation: 'lava-morph-3 22s ease-in-out infinite' }} />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px]" style={{ background: isDark ? 'linear-gradient(315deg, #4338ca 0%, #3730a3 50%, #312e81 100%)' : 'linear-gradient(315deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', filter: 'blur(55px)', opacity: isDark ? 0.45 : 0.6, animation: 'lava-morph-4 18s ease-in-out infinite' }} />
        <div className="absolute bottom-1/3 left-10 w-[350px] h-[350px]" style={{ background: isDark ? 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', borderRadius: '50% 50% 40% 60% / 50% 40% 60% 50%', filter: 'blur(45px)', opacity: isDark ? 0.4 : 0.6, animation: 'lava-morph-5 24s ease-in-out infinite' }} />
        <div className="absolute top-1/4 right-1/5 w-[300px] h-[300px]" style={{ background: isDark ? 'linear-gradient(180deg, #4c1d95 0%, #5b21b6 50%, #312e81 100%)' : 'linear-gradient(180deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)', borderRadius: '60% 40% 70% 30% / 40% 60% 30% 70%', filter: 'blur(40px)', opacity: isDark ? 0.35 : 0.65, animation: 'lava-morph-6 28s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[280px] h-[280px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e3a8a 0%, #3730a3 100%)' : 'linear-gradient(45deg, #2563eb 0%, #3b82f6 100%)', borderRadius: '40% 60% 50% 50% / 50% 40% 50% 60%', filter: 'blur(35px)', opacity: isDark ? 0.3 : 0.55, animation: 'lava-morph-7 30s ease-in-out infinite' }} />

        {/* Subtle overlay for depth */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,26,0.4) 100%)'
              : 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)',
          }}
        />
      </div>

      {/* Main content */}
      <div className="w-full max-w-[480px] relative z-10">
        <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-2xl rounded-lg border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 md:p-10">
          {/* Icon and Title */}
          <div className="flex flex-col items-center mb-10">
            <div className="mb-5 relative">
              {/* Outer animated glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-company-primary/30 via-company-primary/10 to-transparent rounded-full blur-2xl animate-pulse" />
              </div>
              {/* Secondary glow ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-company-primary/20 to-company-primary/5 rounded-full blur-xl" />
              </div>
              {/* Icon */}
              <div className="relative flex items-center justify-center">
                <Sparkles
                  className="h-12 w-12 text-company-primary"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h1 className="text-[1.75rem] leading-tight premium-title premium-title-glow mb-2">
              {t("companies.noCompaniesTitle")}
            </h1>
            <p className="premium-subtitle text-sm text-center">
              {t("companies.noCompaniesPositiveDescription")}
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Link
              href="/dashboard/companies/new?first=1"
              className="group w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-all"
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              <span>{t("companies.createFirstCompany")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

