import type { AxiosError } from "axios";

type ZodFlatten = {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
};

function detailFromValidationErrors(errors: unknown): string | null {
  if (!errors || typeof errors !== "object") return null;
  const flat = errors as ZodFlatten;
  const parts: string[] = [];
  for (const [key, msgs] of Object.entries(flat.fieldErrors ?? {})) {
    if (Array.isArray(msgs) && msgs[0]) parts.push(`${key}: ${msgs[0]}`);
  }
  if (Array.isArray(flat.formErrors)) {
    for (const msg of flat.formErrors) {
      if (msg) parts.push(msg);
    }
  }
  return parts.length > 0 ? parts.slice(0, 4).join(" · ") : null;
}

export function messageFromAxios(err: unknown): string | null {
  if (err && typeof err === "object" && "response" in err) {
    const ax = err as AxiosError<{ message?: string; errors?: unknown }>;
    const data = ax.response?.data;
    const m = data?.message;
    const detail = detailFromValidationErrors(data?.errors);
    if (typeof m === "string" && m.trim()) {
      if (detail) return `${m}: ${detail}`;
      if (typeof data?.errors === "string" && data.errors.trim())
        return `${m}: ${data.errors}`;
      return m;
    }
  }
  if (err instanceof Error) return err.message;
  return null;
}
