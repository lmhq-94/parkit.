"use client";

import Image from "next/image";
import { getIndustryIcon } from "@/lib/companyIcons";
import type { PremiumIcon } from "@/lib/premiumIcons";

/**
 * Banner estilo Microsoft/Google: avatar/logo en círculo a la izquierda
 * y nombre de empresa a la derecha. Misma estructura con o sin imagen de fondo.
 * Si no hay logo, muestra un icono premium acorde a la actividad del negocio.
 * 
 * V2: Diseño premium con glassmorphism mejorado y gradientes elegantes.
 */
export function DefaultBanner({
  companyName,
  logoImageUrl,
  isDark,
  backgroundImageUrl,
  subtitle,
  className = "",
  renderRight,
  businessActivity,
  companyColors,
}: {
  companyName: string;
  logoImageUrl?: string | null;
  /** @deprecated Fallback initials - icon is used instead based on businessActivity */
  _initials?: string;
  isDark: boolean;
  /** Si se indica, se usa como fondo manteniendo el mismo layout (nombre + avatar). */
  backgroundImageUrl?: string | null;
  /** Línea de texto sutil debajo del nombre (opcional). */
  subtitle?: string;
  className?: string;
  /** Contenido personalizado en la parte derecha. Si se indica, reemplaza título/subtítulo por este nodo. */
  renderRight?: React.ReactNode;
  /** Industry/business activity to determine the icon */
  businessActivity?: string | null;
  /** Company colors for the indicator line */
  companyColors?: { primary: string; secondary: string; tertiary: string };
}) {
  const IndustryIcon: PremiumIcon = getIndustryIcon(businessActivity);
  const hasBackgroundImage = Boolean(backgroundImageUrl?.trim());

  return (
    <div
      className={`relative overflow-hidden w-full min-h-[5.5rem] flex items-center ${className}`}
      style={{
        backgroundColor: hasBackgroundImage ? undefined : isDark ? "#0f172a" : "#f8fafc",
      }}
    >
      {/* Fondo premium con gradientes estáticos tipo "animated" pero sin animar */}
      {hasBackgroundImage ? (
        <>
          <Image
            src={backgroundImageUrl!}
            alt=""
            width={3840}
            height={2160}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ transform: "scaleX(-1)" }}
          />
          {/* Overlay premium con gradiente más fuerte para asegurar legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" aria-hidden />
          {/* Segundo overlay sutil para efecto de profundidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" aria-hidden />
        </>
      ) : (
        <>
          {/* Capa base sutil */}
          <div 
            className="absolute inset-0"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
                : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
            }}
          />
          
          {/* Gradiente decorativo 1 - esquina superior derecha */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-40"
            style={{
              background: isDark
                ? "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            }}
          />
          
          {/* Gradiente decorativo 2 - esquina inferior izquierda */}
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-30"
            style={{
              background: isDark
                ? "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
            }}
          />
          
          {/* Líneas diagonales decorativas sutiles */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: isDark
                ? "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)"
                : "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,0.08) 35px, rgba(0,0,0,0.08) 70px)",
            }}
          />
        </>
      )}

      {/* Izquierda: avatar/logo o icono de industria - estilo consistente con perfil */}
      <div className={`relative z-10 shrink-0 pl-4 ${hasBackgroundImage ? "drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" : ""}`}>
        <div
          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: logoImageUrl?.trim()
              ? (isDark ? "rgba(30,41,59,0.9)" : "#ffffff")
              : (isDark ? "hsla(220, 10%, 35%, 1)" : "hsla(220, 10%, 88%, 1)"),
            border: logoImageUrl?.trim()
              ? (isDark ? "1.5px solid rgba(255,255,255,0.2)" : "1.5px solid rgba(0,0,0,0.08)")
              : `2px solid ${isDark ? "hsla(220, 15%, 45%, 0.4)" : "hsla(220, 15%, 75%, 0.6)"}`,
            boxShadow: logoImageUrl?.trim()
              ? (isDark
                  ? "0 6px 16px -4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 0 1px rgba(255,255,255,0.05)"
                  : "0 6px 16px -4px rgba(0,0,0,0.15), 0 1px 2px rgba(255,255,255,1) inset, 0 0 0 1px rgba(255,255,255,0.5)")
              : "0 3px 10px -3px rgba(0,0,0,0.1)",
            color: isDark ? "#e2e8f0" : "#475569",
          }}
        >
          {logoImageUrl?.trim() ? (
            <Image
              src={logoImageUrl}
              alt=""
              width={512}
              height={512}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <IndustryIcon className="w-[18px] h-[18px]" strokeWidth={1.5} />
          )}
        </div>
      </div>

      {/* Derecha: contenido personalizado o título premium */}
      <div className={`relative z-10 flex-1 min-w-0 pl-3 pr-4 flex justify-center ${hasBackgroundImage ? "drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]" : ""}`}>
        {renderRight ? (
          renderRight
        ) : (
          <div
            className="inline-flex flex-col gap-0.5 rounded-xl px-4 py-2.5 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: isDark
                ? "rgba(15,23,42,0.75)"
                : "rgba(255,255,255,0.85)",
              border: isDark
                ? "1px solid rgba(255,255,255,0.15)"
                : "1px solid rgba(255,255,255,0.9)",
              boxShadow: isDark
                ? "0 12px 40px -12px rgba(0,0,0,0.5), 0 4px 12px -4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "0 12px 40px -12px rgba(0,0,0,0.15), 0 4px 12px -4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
            }}
          >
            <p className="text-sm font-bold truncate tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              {companyName || "Company"}
            </p>
            {subtitle && (
              <p className="text-[11px] truncate font-semibold tracking-wide text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                {subtitle}
              </p>
            )}
            {/* Indicador premium más prominente */}
            <div
              className="mt-1.5 w-12 h-0.5 rounded-full"
              style={{
                background: companyColors
                  ? `linear-gradient(90deg, ${companyColors.primary}cc, ${companyColors.secondary}99)`
                  : (isDark
                      ? "linear-gradient(90deg, rgba(59,130,246,0.8), rgba(139,92,246,0.6))"
                      : "linear-gradient(90deg, rgba(59,130,246,0.7), rgba(139,92,246,0.5))"),
                boxShadow: companyColors
                  ? `0 0 8px ${companyColors.primary}66`
                  : (isDark
                      ? "0 0 8px rgba(59,130,246,0.5)"
                      : "0 0 8px rgba(59,130,246,0.3)"),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
