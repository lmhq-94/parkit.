"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { apiClient } from "@/lib/api";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-2 rounded-xl bg-card border border-card-border w-10 h-10 flex items-center justify-center" />
    );
  }

  const isDark = theme === "dark";

  const handleToggle = () => {
    const nextTheme: "light" | "dark" = isDark ? "light" : "dark";
    setTheme(nextTheme);
    apiClient
      .patch("/users/me", {
        appPreferences: { theme: nextTheme },
      })
      .catch(() => {
        // No bloquear la UI si falla guardar la preferencia.
      });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="h-10 w-10 rounded-xl bg-card border border-card-border text-company-secondary hover:text-text-primary hover:bg-company-tertiary-subtle transition-colors flex items-center justify-center"
      title={isDark ? "Cambiar a tema claro" : "Switch to dark theme"}
      aria-label={isDark ? "Tema claro" : "Dark theme"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
