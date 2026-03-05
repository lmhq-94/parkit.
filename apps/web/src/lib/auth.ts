export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  systemRole: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";
  companyId?: string;
  avatar?: string;
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
