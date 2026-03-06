"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
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
    }, 150);
    return () => clearTimeout(timer);
  }, [hydrate, router]);

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <>{children}</>;
}
