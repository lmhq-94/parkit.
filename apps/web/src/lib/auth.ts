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

/** First name + first last name (e.g. "Juan Carlos" + "García López" → "Juan García"). To display next to avatar. */
export function getShortName(user: User | null): string {
  if (!user) return "";
  const first = (user.firstName ?? "").trim();
  const last = (user.lastName ?? "").trim();
  const firstWord = first.split(/\s+/)[0] ?? "";
  const lastWord = last.split(/\s+/)[0] ?? "";
  return [firstWord, lastWord].filter(Boolean).join(" ").trim();
}

/** Initials for avatar: only first name and first last name (e.g. "Juan Carlos García López" → "JG"). If no name, uses first two letters of email. */
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

/** Background color for initials avatar (when no photo). Same userId → same color. */
const AVATAR_COLORS = [
  "#0ea5e9", "#8b5cf6", "#059669", "#d97706",
  "#dc2626", "#7c3aed", "#0d9488", "#b45309",
];

export function getAvatarColor(userId: string | null | undefined): string | undefined {
  if (!userId) return undefined;
  const index = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}


/** HSL colors for mobile-valet style avatar (neutral) */
export function getAvatarHSLColors(
  _userId: string | null | undefined,
  isDark = false
): { bg: string; fg: string; border: string } {
  // Use neutral colors (bluish gray) for both themes
  if (isDark) {
    return {
      bg: "hsla(220, 10%, 35%, 1)",
      fg: "hsla(220, 10%, 85%, 1)",
      border: "hsla(220, 15%, 45%, 0.4)",
    };
  }
  return {
    bg: "hsla(220, 10%, 88%, 1)",
    fg: "hsla(220, 10%, 45%, 1)",
    border: "hsla(220, 15%, 75%, 0.6)",
  };
}
