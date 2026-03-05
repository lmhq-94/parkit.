"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user === null && typeof window !== "undefined") {
      // Give a moment for hydration
      const timer = setTimeout(() => {
        if (!user) {
          router.push("/login");
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <>{children}</>;
}
