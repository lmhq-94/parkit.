import type { AxiosError } from "axios";

export function messageFromAxios(err: unknown): string | null {
  if (err && typeof err === "object" && "response" in err) {
    const ax = err as AxiosError<{ message?: string }>;
    const m = ax.response?.data?.message;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (err instanceof Error) return err.message;
  return null;
}
