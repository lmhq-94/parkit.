import * as SecureStore from "expo-secure-store";

export type Locale = "es" | "en";

const translations: Record<Locale, Record<string, string>> = {
  es: {
    "welcome.cta": "Empecemos",
    "welcome.login": "INICIAR SESIÓN",
    "welcome.signup": "REGISTRARSE",
    "login.welcomeBack": "Bienvenido de nuevo a",
    "login.brand": "Parkit",
    "login.headline": "Inicia sesión en el sistema valet",
    "login.subtitle": "Inicia sesión para acceder al sistema valet",
    "login.email": "Correo electrónico",
    "login.password": "Contraseña",
    "login.placeholderEmail": "ejemplo@correo.com",
    "login.placeholderPassword": "******",
    "login.forgetPassword": "¿Olvidaste tu contraseña?",
    "login.submit": "INICIAR SESIÓN",
    "login.footer": "Acceso restringido. Solo personal. ",
    "login.contactSupport": "Contactar soporte",
    "signup.headline": "Regístrate como valet",
    "signup.firstName": "Nombre",
    "signup.lastName": "Apellido",
    "signup.email": "Correo electrónico",
    "signup.password": "Contraseña",
    "signup.licenseNumber": "Número de licencia",
    "signup.licenseExpiry": "Vencimiento de licencia",
    "signup.placeholderFirstName": "Nombre",
    "signup.placeholderLastName": "Apellido",
    "signup.placeholderEmail": "ejemplo@correo.com",
    "signup.placeholderPassword": "******",
    "signup.placeholderLicenseNumber": "LIC-12345",
    "signup.placeholderLicenseExpiry": "YYYY-MM-DD",
    "signup.submit": "REGISTRARSE",
    "settings.language": "Idioma",
    "settings.spanish": "Español",
    "settings.english": "English",
    "common.loading": "Cargando…",
    "common.errorFillFields": "Completa todos los campos",
    "common.loginFailed": "Error al iniciar sesión",
  },
  en: {
    "welcome.cta": "Let's get started",
    "welcome.login": "LOGIN",
    "welcome.signup": "SIGN UP",
    "login.welcomeBack": "Welcome back to",
    "login.brand": "Parkit",
    "login.headline": "Sign in to the valet system",
    "login.subtitle": "Sign in to access the valet system",
    "login.email": "Email",
    "login.password": "Password",
    "login.placeholderEmail": "example@email.com",
    "login.placeholderPassword": "******",
    "login.forgetPassword": "Forget password",
    "login.submit": "LOGIN",
    "login.footer": "Restricted access. Staff only. ",
    "login.contactSupport": "Contact support",
    "signup.headline": "Sign up as a valet",
    "signup.firstName": "First name",
    "signup.lastName": "Last name",
    "signup.email": "Email",
    "signup.password": "Password",
    "signup.licenseNumber": "License number",
    "signup.licenseExpiry": "License expiry",
    "signup.placeholderFirstName": "First name",
    "signup.placeholderLastName": "Last name",
    "signup.placeholderEmail": "example@email.com",
    "signup.placeholderPassword": "******",
    "signup.placeholderLicenseNumber": "LIC-12345",
    "signup.placeholderLicenseExpiry": "YYYY-MM-DD",
    "signup.submit": "SIGN UP",
    "settings.language": "Language",
    "settings.spanish": "Español",
    "settings.english": "English",
    "common.loading": "Loading…",
    "common.errorFillFields": "Please fill all fields",
    "common.loginFailed": "Login failed",
  },
};

export function t(locale: Locale, key: string, vars?: Record<string, string>): string {
  const value = translations[locale]?.[key] ?? translations.en[key] ?? key;
  if (vars) {
    return Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{{${k}}}`, v), value);
  }
  return value;
}

const LOCALE_KEY = "parkit_valet_locale";

export async function getStoredLocale(): Promise<Locale> {
  try {
    const stored = await SecureStore.getItemAsync(LOCALE_KEY);
    return stored === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

export async function setStoredLocale(locale: Locale): Promise<void> {
  try {
    await SecureStore.setItemAsync(LOCALE_KEY, locale);
  } catch (e) {
    console.error("Failed to persist locale", e);
  }
}
