"use client";

import localFont from "next/font/local";

const calSans = localFont({
  src: "../fonts/CalSans.ttf",
  variable: "--font-calsans",
  display: "swap",
});

type LogoVariant = "default" | "onDark";

export function Logo({
  className = "",
  variant = "default",
}: {
  className?: string;
  /** Use "onDark" on dark backgrounds for maximum contrast (white + bright blue, subtle glow) */
  variant?: LogoVariant;
}) {
  const isOnDark = variant === "onDark";

  return (
    <div
      className={`${calSans.variable} font-calsans text-4xl tracking-tighter flex items-center ${className}`}
    >
      <span
        className={
          isOnDark
            ? "text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-colors duration-300"
            : "text-slate-900 dark:text-white transition-colors duration-300"
        }
      >
        park
      </span>
      <span
        className={
          isOnDark
            ? "text-sky-300 drop-shadow-[0_0_16px_rgba(56,189,248,0.25)] transition-colors duration-300"
            : "text-blue-600 dark:text-blue-500 transition-colors duration-300"
        }
      >
        it.
      </span>
    </div>
  );
}
