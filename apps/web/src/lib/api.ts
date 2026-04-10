import axios, { AxiosInstance, AxiosError } from "axios";
import { useDashboardStore } from "@/lib/store";

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const GET_CACHE_TTL_MS = 30_000; // 30s for branding and data that does not change constantly
const CACHEABLE_GET_PREFIXES = [
  "/companies/me",
  "/companies/",
  "/companies",
  "/users/me",
  "/clients",
  "/notifications/user/",
  "/parkings/has-bookable",
];

function isCacheableGet(url: string): boolean {
  return CACHEABLE_GET_PREFIXES.some((p) => url.includes(p));
}

type CacheEntry<T> = { data: T; expiresAt: number };

class ApiClient {
  private client: AxiosInstance;
  private getCache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, Promise<unknown>>();

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include JWT token and x-company-id for SUPER_ADMIN
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const companyId =
        typeof window !== "undefined"
          ? localStorage.getItem("parkit_selected_company_id")
          : null;
      if (companyId) {
        config.headers["x-company-id"] = companyId;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        const message =
          typeof error.response?.data === "object" && error.response.data !== null && "message" in error.response.data
            ? String((error.response.data as { message?: unknown }).message)
            : "";

        // Invalid or deleted company: clear selection so user can pick a valid one
        if (
          (error.response?.status === 400 || error.response?.status === 403) &&
          (message.includes("Invalid x-company-id") || message.includes("Company not found"))
        ) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("parkit_selected_company_id");
            localStorage.removeItem("parkit_selected_company_name");
            useDashboardStore.getState().setSelectedCompany(null, null);
            this.clearGetCache();
          }
        }

        // Handle 401 - redirect to login (except on auth endpoints like /auth/login)
        if (error.response?.status === 401) {
          const url = error.config?.url ?? "";
          const isAuthEndpoint = typeof url === "string" && url.startsWith("/auth/");
          if (!isAuthEndpoint) {
            this.clearToken();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  }

  public setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  public clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }

  // API methods
  public async get<T>(url: string): Promise<T> {
    const cacheKey = url;
    if (typeof window !== "undefined" && isCacheableGet(url)) {
      const hit = this.getCache.get(cacheKey) as CacheEntry<T> | undefined;
      if (hit && hit.expiresAt > Date.now()) return hit.data;
    }

    const pending = this.pendingRequests.get(cacheKey) as Promise<T> | undefined;
    if (pending) return pending;

    const promise = (async () => {
      try {
        const response = await this.client.get<ApiResponse<T>>(url);
        const data = response.data.data as T;
        if (typeof window !== "undefined" && isCacheableGet(url)) {
          this.getCache.set(cacheKey, {
            data,
            expiresAt: Date.now() + GET_CACHE_TTL_MS,
          });
        }
        return data;
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  /** Invalidates GET cache (e.g. after branding update). */
  public clearGetCache(): void {
    this.getCache.clear();
  }

  public async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    this.clearGetCache();
    return response.data.data as T;
  }

  public async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    this.clearGetCache();
    return response.data.data as T;
  }

  public async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    this.clearGetCache();
    return response.data.data as T;
  }
}

export const apiClient = new ApiClient();

/** Extracts API error message from an error object (Axios or otherwise). */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    const msg = data?.message;
    if (typeof msg === "string" && msg.length > 0) return msg;
    const errs = data?.errors;
    if (typeof errs === "string" && errs.length > 0) return errs;
    if (errs != null && typeof errs === "object") return "Validation failed";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Request failed";
}

/** Maps API messages (in English) to translation keys for the selected locale. */
const API_MESSAGE_TO_I18N_KEY: Record<string, string> = {
  "Email already in use": "apiErrors.emailAlreadyInUse",
  "Vehicle with this plate already exists": "apiErrors.vehiclePlateAlreadyExists",
  "Validation failed": "apiErrors.validationFailed",
  "Request failed": "apiErrors.requestFailed",
  "Invalid credentials": "auth.invalidCredentials",
  "Invalid or expired reset link. Request a new one from the login page.": "auth.resetLinkInvalid",
};

/**
 * Returns the API error message translated to the current locale.
 * @param error - Error returned by the API or Axios.
 * @param t - Translation function (e.g. from useTranslation().t).
 */
export function getTranslatedApiErrorMessage(
  error: unknown,
  t: (key: string) => string
): string {
  const raw = getApiErrorMessage(error);
  const key = API_MESSAGE_TO_I18N_KEY[raw];
  return key ? t(key) : raw;
}
