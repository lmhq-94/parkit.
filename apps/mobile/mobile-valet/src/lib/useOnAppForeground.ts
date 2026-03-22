import { AppState, type AppStateStatus } from "react-native";
import { useEffect, useRef } from "react";

/**
 * Ejecuta el callback cada vez que la app vuelve a primer plano (`active`).
 * Útil para alinear datos con cambios hechos en web mientras la app estaba en segundo plano.
 */
export function useOnAppForeground(onForeground: () => void) {
  const ref = useRef(onForeground);
  ref.current = onForeground;
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "active") {
        ref.current();
      }
    });
    return () => sub.remove();
  }, []);
}
