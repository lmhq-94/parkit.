"use client";

import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";

// =============================================================================
// Types
// =============================================================================

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

export interface DropdownPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  width?: number;
  maxHeight?: number;
}

export interface DropdownSection {
  title?: string;
  items: DropdownOption[];
}

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  position: DropdownPosition;
  setPosition: (pos: DropdownPosition) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("useDropdownContext must be used within PremiumDropdown");
  return ctx;
}

// =============================================================================
// Style Utilities
// =============================================================================

function getDropdownStyles(isDark: boolean): React.CSSProperties {
  return {
    background: isDark
      ? "linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)"
      : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.99) 100%)",
    boxShadow: isDark
      ? "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), 0 10px 20px -5px rgba(0,0,0,0.4)"
      : "0 25px 50px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.8) inset, 0 10px 20px -5px rgba(0,0,0,0.1)",
    backdropFilter: "blur(24px) saturate(180%)",
  };
}

function getItemStyles(
  _isDark: boolean,
  isSelected: boolean,
  isDestructive: boolean
): string {
  const baseStyles = "w-full px-3 py-2.5 text-left text-sm rounded-xl transition-all duration-200 flex items-center gap-3";
  
  if (isDestructive) {
    return `${baseStyles} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10`;
  }
  
  if (isSelected) {
    return `${baseStyles} bg-company-primary/10 dark:bg-company-primary/20 text-company-primary font-medium`;
  }
  
  return `${baseStyles} text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80`;
}

// =============================================================================
// Components
// =============================================================================

interface PremiumDropdownRootProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export function PremiumDropdown({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}: PremiumDropdownRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [position, setPosition] = useState<DropdownPosition>({});
  const triggerRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledOpen ?? uncontrolledOpen;
  const setIsOpen = useCallback(
    (open: boolean) => {
      setUncontrolledOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  const value: DropdownContextValue = {
    isOpen,
    setIsOpen,
    position,
    setPosition,
    triggerRef,
    dropdownRef,
  };

  return (
    <DropdownContext.Provider value={value}>
      {children}
    </DropdownContext.Provider>
  );
}

// =============================================================================
// Trigger
// =============================================================================

interface PremiumDropdownTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

export function PremiumDropdownTrigger({
  children,
  asChild = false,
}: PremiumDropdownTriggerProps) {
  const { setIsOpen, isOpen, setPosition, triggerRef } = useDropdownContext();

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openUp = spaceBelow < 250 && spaceAbove > spaceBelow;

    setPosition({
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? vh - rect.top + 6 : undefined,
      left: rect.left,
      right: window.innerWidth - rect.right,
      width: Math.max(rect.width, 200),
      maxHeight: Math.min(420, openUp ? spaceAbove : spaceBelow),
    });
  }, [setPosition, triggerRef]);

  const handleClick = useCallback(() => {
    if (!isOpen) updatePosition();
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !triggerRef.current?.contains(target) &&
        !target.closest("[data-premium-dropdown]")
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setIsOpen, triggerRef]);

  if (asChild) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onClick: handleClick,
      "aria-expanded": isOpen,
      "aria-haspopup": "menu",
    } as React.HTMLAttributes<HTMLElement>);
  }

  // If not asChild, render children directly with the div wrapper
  return (
    <div
      ref={triggerRef as unknown as React.RefObject<HTMLDivElement>}
      onClick={handleClick}
      role="button"
      aria-expanded={isOpen}
      aria-haspopup="menu"
      className="inline-block cursor-pointer"
    >
      {children}
    </div>
  );
}

// =============================================================================
// Content (Portal)
// =============================================================================

interface PremiumDropdownContentProps {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  side?: "top" | "bottom";
  className?: string;
  style?: React.CSSProperties;
}

export function PremiumDropdownContent({
  children,
  align = "end",
  side = "bottom",
  className = "",
  style = {},
}: PremiumDropdownContentProps) {
  const { isOpen, position, dropdownRef } = useDropdownContext();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!isOpen || typeof document === "undefined") return null;

  const dropdownStyles = getDropdownStyles(isDark);

  const alignStyles: React.CSSProperties =
    align === "end" && position.right !== undefined
      ? { right: position.right, left: "auto" }
      : align === "start" && position.left !== undefined
      ? { left: position.left }
      : { left: position.left };

  const sideStyles: React.CSSProperties =
    side === "bottom" && position.top !== undefined
      ? { top: position.top }
      : side === "top" && position.bottom !== undefined
      ? { bottom: position.bottom }
      : { top: position.top };

  return createPortal(
    <div
      ref={dropdownRef}
      data-premium-dropdown
      className={`fixed z-[99999] flex flex-col rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-[200px] ${className}`}
      style={{
        ...dropdownStyles,
        ...alignStyles,
        ...sideStyles,
        width: position.width,
        maxHeight: position.maxHeight || "min(70vh, 420px)",
        ...style,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

// =============================================================================
// Header
// =============================================================================

interface PremiumDropdownHeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PremiumDropdownHeader({
  title,
  subtitle,
  children,
}: PremiumDropdownHeaderProps) {
  if (children) {
    return (
      <div className="px-4 py-3.5 border-b border-slate-200/60 dark:border-slate-700/60">
        {children}
      </div>
    );
  }

  return (
    <div className="px-4 py-3.5 border-b border-slate-200/60 dark:border-slate-700/60">
      {title && (
        <p className="premium-label">
          {title}
        </p>
      )}
      {subtitle && (
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1 truncate tracking-tight">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Item
// =============================================================================

interface PremiumDropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  selected?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PremiumDropdownItem({
  children,
  onClick,
  icon,
  selected = false,
  destructive = false,
  disabled = false,
  className = "",
}: PremiumDropdownItemProps) {
  const { setIsOpen } = useDropdownContext();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setIsOpen(false);
  };

  const itemClassName = getItemStyles(isDark, selected, destructive);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`${itemClassName} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {icon && (
        <span
          className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-200 ${
            destructive
              ? "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400"
              : selected
              ? "bg-company-primary/20 text-company-primary"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          }`}
        >
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })
            : icon}
        </span>
      )}
      <span className="font-medium">{children}</span>
    </button>
  );
}

// =============================================================================
// Separator
// =============================================================================

export function PremiumDropdownSeparator() {
  return (
    <div className="h-px mx-3 my-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
  );
}

// =============================================================================
// Group
// =============================================================================

interface PremiumDropdownGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function PremiumDropdownGroup({
  children,
  className = "",
}: PremiumDropdownGroupProps) {
  return (
    <div className={`p-1.5 overflow-y-auto overscroll-contain min-h-0 flex-1 space-y-0.5 ${className}`}>
      {children}
    </div>
  );
}

// =============================================================================
// Simple API for common use cases
// =============================================================================

interface SimplePremiumDropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  header?: { title?: string; subtitle?: string };
  align?: "start" | "end" | "center";
}

export function SimplePremiumDropdown({
  trigger,
  options,
  value,
  onChange,
  header,
  align = "end",
}: SimplePremiumDropdownProps) {
  return (
    <PremiumDropdown>
      <PremiumDropdownTrigger>
        <div className="cursor-pointer">{trigger}</div>
      </PremiumDropdownTrigger>
      <PremiumDropdownContent align={align}>
        {header && <PremiumDropdownHeader title={header.title} subtitle={header.subtitle} />}
        <PremiumDropdownGroup>
          {options.map((option) => (
            <PremiumDropdownItem
              key={option.value}
              onClick={() => onChange?.(option.value)}
              icon={option.icon}
              selected={value === option.value}
              destructive={option.destructive}
            >
              {option.label}
            </PremiumDropdownItem>
          ))}
        </PremiumDropdownGroup>
      </PremiumDropdownContent>
    </PremiumDropdown>
  );
}
