"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Sun, Moon } from "lucide-react";
import { apiClient } from "@/lib/api";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    handleThemeChange(newTheme);
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    apiClient
      .patch("/users/me", {
        appPreferences: { theme: newTheme },
      })
      .catch(() => {
        // Do not block UI if saving preference fails.
      });
  };

  if (!mounted) {
    return (
      <div className="p-2 rounded-lg w-10 h-10 flex items-center justify-center" />
    );
  }

  const isDark = theme === "dark";

  return (
    <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={handleToggle}
          className="h-10 w-10 rounded-lg text-company-secondary hover:text-text-primary hover:bg-company-tertiary-subtle transition-colors flex items-center justify-center"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    </div>
  );
}
