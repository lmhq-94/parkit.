import type { Locale } from "@parkit/shared";
export type { Locale };

const translations: Record<Locale, Record<string, string>> = {
  es: {
    "welcome.cta": "Empecemos",
    "welcome.login": "INICIAR SESIÓN",
    "welcome.signup": "REGISTRARSE",
    "welcome.version": "Versión {{version}}",
    "login.welcomeBack": "Bienvenido de nuevo a",
    "login.brand": "Parkit",
    "login.headline": "Inicia sesión en tu cuenta",
    "login.email": "Correo electrónico",
    "login.password": "Contraseña",
    "login.placeholderEmail": "ejemplo@correo.com",
    "login.placeholderPassword": "******",
    "login.forgetPassword": "¿Olvidaste tu contraseña?",
    "login.submit": "INICIAR SESIÓN",
    "login.newTo": "¿Nuevo en Parkit? ",
    "login.signUp": "Registrarse",
    "login.needHelp": "¿Necesitas ayuda? ",
    "login.contactSupport": "Contactar soporte",
    "signup.newTo": "¿Nuevo en Parkit?",
    "signup.signUp": "Registrarse",
    "signup.headline": "Crea tu cuenta",
    "signup.firstName": "Nombre",
    "signup.lastName": "Apellido",
    "signup.email": "Correo electrónico",
    "signup.password": "Contraseña",
    "signup.placeholderEmail": "ejemplo@correo.com",
    "signup.placeholderPassword": "******",
    "signup.submit": "REGISTRARSE",
    "signup.alreadyHave": "¿Ya tienes cuenta? ",
    "signup.login": "Iniciar sesión",
    "forgot.title": "¿Olvidaste tu contraseña?",
    "forgot.headline": "Recupera el acceso a tu cuenta",
    "forgot.description": "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.",
    "forgot.sent": "Si existe una cuenta para {{email}}, recibirás un enlace para restablecer tu contraseña.",
    "forgot.placeholderEmail": "ejemplo@correo.com",
    "forgot.sendLink": "Enviar enlace",
    "forgot.backToLogin": "Volver a iniciar sesión",
    "forgot.errorSend": "No se pudo enviar la solicitud. Inténtalo de nuevo.",
    "settings.language": "Idioma",
    "settings.spanish": "Español",
    "settings.english": "English",
    "settings.preferencesSection": "Preferencias de la app",
    "settings.theme": "Tema",
    "settings.themeLight": "Claro",
    "settings.themeDark": "Oscuro",
    "settings.themeSystem": "Sistema",
    "settings.save": "GUARDAR CAMBIOS",
    "settings.saveSuccess": "Preferencias guardadas",
    "profile.accountInfo": "Información de la cuenta",
    "profile.email": "Correo",
    "profile.name": "Nombre",
    "profile.role": "Rol",
    "profile.logout": "Cerrar sesión",
    "common.loading": "Cargando…",
    "common.errorFillFields": "Completa todos los campos",
    "common.errorPasswordLength": "La contraseña debe tener al menos 6 caracteres",
    "common.loginFailed": "Error al iniciar sesión",
    "common.signupFailed": "Error al registrarse",
    "common.registrationFailed": "Error en el registro",
  },
  en: {
    "welcome.cta": "Let's get started",
    "welcome.login": "LOGIN",
    "welcome.signup": "SIGN UP",
    "welcome.version": "Version {{version}}",
    "login.welcomeBack": "Welcome back to",
    "login.brand": "Parkit",
    "login.headline": "Sign in to your account",
    "login.email": "Email",
    "login.password": "Password",
    "login.placeholderEmail": "example@email.com",
    "login.placeholderPassword": "******",
    "login.forgetPassword": "Forget password",
    "login.submit": "LOGIN",
    "login.newTo": "New to Parkit? ",
    "login.signUp": "Sign up",
    "login.needHelp": "Need help? ",
    "login.contactSupport": "Contact support",
    "signup.newTo": "New to Parkit?",
    "signup.signUp": "Sign up",
    "signup.headline": "Create your account",
    "signup.firstName": "First name",
    "signup.lastName": "Last name",
    "signup.email": "Email",
    "signup.password": "Password",
    "signup.placeholderEmail": "example@email.com",
    "signup.placeholderPassword": "******",
    "signup.submit": "SIGN UP",
    "signup.alreadyHave": "Already have an account? ",
    "signup.login": "Login",
    "forgot.title": "Forgot password?",
    "forgot.headline": "Get back into your account",
    "forgot.description": "Enter your email and we'll send you a link to reset your password.",
    "forgot.sent": "If an account exists for {{email}}, you'll receive a link to reset your password.",
    "forgot.placeholderEmail": "example@email.com",
    "forgot.sendLink": "Send reset link",
    "forgot.backToLogin": "Back to Login",
    "forgot.errorSend": "Could not send the request. Please try again.",
    "settings.language": "Language",
    "settings.spanish": "Español",
    "settings.english": "English",
    "settings.preferencesSection": "App Preferences",
    "settings.theme": "Theme",
    "settings.themeLight": "Light",
    "settings.themeDark": "Dark",
    "settings.themeSystem": "System",
    "settings.save": "SAVE CHANGES",
    "settings.saveSuccess": "Preferences saved",
    "profile.accountInfo": "Account Information",
    "profile.email": "Email",
    "profile.name": "Name",
    "profile.role": "Role",
    "profile.logout": "Logout",
    "common.loading": "Loading…",
    "common.errorFillFields": "Please fill all fields",
    "common.errorPasswordLength": "Password must be at least 6 characters",
    "common.loginFailed": "Login failed",
    "common.signupFailed": "Sign up failed",
    "common.registrationFailed": "Registration failed",
  },
};

export function t(locale: Locale, key: string, vars?: Record<string, string>): string {
  const value = translations[locale]?.[key] ?? translations.en[key] ?? key;
  if (vars) {
    return Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{{${k}}}`, v), value);
  }
  return value;
}

import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCALE_KEY = "parkit_locale";

export async function getStoredLocale(): Promise<Locale> {
  try {
    const stored = await AsyncStorage.getItem(LOCALE_KEY);
    return stored === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

export async function setStoredLocale(locale: Locale): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCALE_KEY, locale);
  } catch (e) {
    console.error("Failed to persist locale", e);
  }
}
