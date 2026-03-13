import type { User as BaseUser, SystemRole } from "../../../../packages/shared/src";

export interface User extends BaseUser {
  systemRole: SystemRole;
  avatar?: string;
  avatarUrl?: string;
  phone?: string;
  timezone?: string;
  appPreferences?: {
    theme?: "light" | "dark";
    locale?: "es" | "en";
  };
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
}

export function setStoredUser(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

export function clearStoredUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  }
}

export function isSuperAdmin(user: User | null): boolean {
  return user?.systemRole === "SUPER_ADMIN";
}

export function isAdmin(user: User | null): boolean {
  return user?.systemRole === "ADMIN" || user?.systemRole === "SUPER_ADMIN";
}

export function isStaff(user: User | null): boolean {
  return user?.systemRole === "STAFF";
}

export function getFullName(user: User | null): string {
  if (!user) return "";
  return `${user.firstName} ${user.lastName}`.trim();
}

/** Primer nombre + primer apellido (ej: "Juan Carlos" + "García López" → "Juan García"). Para mostrar junto al avatar. */
export function getShortName(user: User | null): string {
  if (!user) return "";
  const first = (user.firstName ?? "").trim();
  const last = (user.lastName ?? "").trim();
  const firstWord = first.split(/\s+/)[0] ?? "";
  const lastWord = last.split(/\s+/)[0] ?? "";
  return [firstWord, lastWord].filter(Boolean).join(" ").trim();
}

/** Iniciales para avatar: solo primer nombre y primer apellido (ej: "Juan Carlos García López" → "JG"). Si no hay nombre, usa las dos primeras letras del email. */
export function getInitials(user: User | null): string {
  if (!user) return "?";
  const first = (user.firstName ?? "").trim();
  const last = (user.lastName ?? "").trim();
  const firstWord = first.split(/\s+/)[0] ?? "";
  const lastWord = last.split(/\s+/)[0] ?? "";
  if (firstWord && lastWord) return `${firstWord[0]}${lastWord[0]}`.toUpperCase();
  if (firstWord) return firstWord.slice(0, 2).toUpperCase();
  if (lastWord) return lastWord.slice(0, 2).toUpperCase();
  const email = (user.email ?? "").trim();
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

/** Color de fondo para avatar de iniciales (cuando no hay foto). Mismo userId → mismo color. */
const AVATAR_COLORS = [
  "#0ea5e9", "#8b5cf6", "#059669", "#d97706",
  "#dc2626", "#7c3aed", "#0d9488", "#b45309",
];

export function getAvatarColor(userId: string | null | undefined): string | undefined {
  if (!userId) return undefined;
  const index = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
