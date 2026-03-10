import axios, { AxiosInstance, AxiosError } from "axios";

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

class ApiClient {
  private client: AxiosInstance;

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
        // Handle 401 - redirect to login (except on auth endpoints like /auth/login)
        if (error.response?.status === 401) {
          const url = error.config?.url ?? "";
          // Para errores en endpoints de autenticación dejamos que la UI maneje el mensaje
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
    const response = await this.client.get<ApiResponse<T>>(url);
    return response.data.data as T;
  }

  public async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data.data as T;
  }

  public async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data.data as T;
  }

  public async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data.data as T;
  }
}

export const apiClient = new ApiClient();

/** Extrae el mensaje de error de la API a partir de un error (Axios u otro). */
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
