"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { PageLoader } from "@/components/PageLoader";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loggingOut = useAuthStore((s) => s.loggingOut);
  const hydrate = useAuthStore((s) => s.hydrate);
  const redirecting = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    hydrate();
    const timer = setTimeout(() => {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser && !redirecting.current) {
        redirecting.current = true;
        router.replace("/login");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [hydrate, router]);

  // During active logout: render nothing (sidebar already navigates to /login)
  if (loggingOut) return null;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-page">
        <PageLoader />
      </div>
    );
  }

  return <>{children}</>;
}
