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
    if (!ax.response) {
      if (ax.message && ax.message.toLowerCase().includes("network")) {
        return "NETWORK_ERROR";
      }
      return "NETWORK_ERROR";
    }
    const m = data?.message;
    const detail = detailFromValidationErrors(data?.errors);
    if (typeof m === "string" && m.trim()) {
      if (detail) return `${m}: ${detail}`;
      if (typeof data?.errors === "string" && data.errors.trim())
        return `${m}: ${data.errors}`;
      return m;
    }
  }
  if (err instanceof Error) {
    if (err.message.toLowerCase().includes("network")) return "NETWORK_ERROR";
    return err.message;
  }
  return null;
}

export function getTranslatedApiErrorMessage(
  err: unknown,
  t: (locale: any, key: string) => string,
  locale: string,
): string {
  const msg = messageFromAxios(err);
  if (!msg) return t(locale, "common.loginFailed");

  if (msg === "Invalid credentials") return t(locale, "login.errorInvalidCredentials");
  if (msg === "Email already in use") return t(locale, "signup.errorEmailTaken");
  if (msg === "USER_INACTIVE") return t(locale, "login.accountInactive");
  if (msg === "COMPANY_INACTIVE") return t(locale, "auth.errorCompanyInactive");
  if (msg.includes("Account pending")) return t(locale, "auth.errorAccountPending");
  if (msg.includes("Invalid or expired invitation")) return t(locale, "auth.errorInvalidInvite");
  if (msg.includes("Invalid or expired reset link")) return t(locale, "auth.errorInvalidReset");
  if (msg.includes("Invalid code") || msg.includes("expired code"))
    return t(locale, "auth.errorInvalidCode");
  if (msg === "NETWORK_ERROR") return t(locale, "common.networkError");

  return msg;
}
