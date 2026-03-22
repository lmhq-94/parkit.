import Constants from "expo-constants";

/** Versión legible desde `app.config` / nativo (p. ej. `1.0.0`). */
export function getAppVersionString(): string {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeApplicationVersion ??
    ""
  );
}
