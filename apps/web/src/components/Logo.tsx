"use client";

import { LOGO_LETTER_SPACING_EM } from "@parkit/shared";
import localFont from "next/font/local";

const calSans = localFont({
  src: "../fonts/CalSans.ttf",
  display: "swap",
});

type LogoVariant = "default" | "onDark" | "mark" | "markOnDark";

export function Logo({
  className = "",
  variant = "default",
}: {
  className?: string;
  /** "onDark" = full logo on dark bg. "mark" = solo "p." (fondo claro). "markOnDark" = solo "p." en fondo oscuro. */
  variant?: LogoVariant;
}) {
  const isOnDark = variant === "onDark" || variant === "markOnDark";
  const isMark = variant === "mark" || variant === "markOnDark";

  return (
    <div
      style={{
        ...calSans.style,
        letterSpacing: `${LOGO_LETTER_SPACING_EM}em`,
      }}
      className={`font-bold flex items-center ${isMark ? "text-xl" : "text-4xl"} ${className}`}
    >
      <span
        className={
          isOnDark
            ? "text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-colors duration-300"
            : "text-slate-900 dark:text-white transition-colors duration-300"
        }
      >
        {isMark ? "p" : "park"}
      </span>
      <span
        className={
          isOnDark
            ? "text-sky-300 drop-shadow-[0_0_16px_rgba(56,189,248,0.25)] transition-colors duration-300"
            : "text-blue-600 dark:text-blue-500 transition-colors duration-300"
        }
      >
        {isMark ? "." : "it."}
      </span>
    </div>
  );
}
