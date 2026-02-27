"use client";

import localFont from "next/font/local";

const calSans = localFont({
  src: "../fonts/CalSans.ttf",
  variable: "--font-calsans",
  display: "swap",
});

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`${calSans.variable} font-calsans text-4xl tracking-tighter flex items-center ${className}`}>
      <span className="text-slate-900 dark:text-white transition-colors duration-300">park</span>
      <span className="text-blue-600 dark:text-blue-500 transition-colors duration-300">it.</span>
    </div>
  );
}
