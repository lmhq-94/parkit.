"use client";

import { ChevronDown } from "lucide-react";

interface SelectFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

export function SelectField({ value, onChange, icon: Icon, children, className }: SelectFieldProps) {
  return (
    <div className="relative group">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-sky-500 transition-colors pointer-events-none" />
      )}
      <select
        value={value}
        onChange={onChange}
        className={[
          "w-full py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm",
          "appearance-none cursor-pointer transition-colors",
          "hover:border-sky-500/40",
          "focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500",
          Icon ? "pl-10 pr-9" : "pl-4 pr-9",
          className ?? "",
        ].join(" ")}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50 pointer-events-none transition-transform group-focus-within:rotate-180 group-focus-within:text-sky-500" />
    </div>
  );
}
