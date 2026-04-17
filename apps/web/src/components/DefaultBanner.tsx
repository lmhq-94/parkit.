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
        backgroundColor: hasBackgroundImage ? undefined : isDark ? "#0a0a1a" : "#f0f9ff",
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
          {/* Base gradient */}
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a1a 100%)'
                : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0f2fe 75%, #f0f9ff 100%)',
            }}
          />

          {/* Blob shapes - scaled for banner (static) */}
          <div className="absolute -top-6 -right-6 w-[90px] h-[90px]" style={{ background: isDark ? 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(16px)', opacity: isDark ? 0.35 : 0.3 }} />
          <div className="absolute top-1/3 -right-4 w-[85px] h-[85px]" style={{ background: isDark ? 'linear-gradient(225deg, #3730a3 0%, #4338ca 50%, #1e3a5f 100%)' : 'linear-gradient(225deg, #6366f1 0%, #818cf8 50%, #a78bfa 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', filter: 'blur(14px)', opacity: isDark ? 0.3 : 0.25 }} />
          <div className="absolute bottom-2 left-1/4 w-[75px] h-[75px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)' : 'linear-gradient(45deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)', borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%', filter: 'blur(12px)', opacity: isDark ? 0.25 : 0.2 }} />
          <div className="absolute top-1/2 right-1/5 w-[65px] h-[65px]" style={{ background: isDark ? 'linear-gradient(315deg, #4338ca 0%, #3730a3 50%, #312e81 100%)' : 'linear-gradient(315deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', filter: 'blur(10px)', opacity: isDark ? 0.2 : 0.15 }} />

          {/* Overlay */}
          <div className="absolute inset-0 transition-all duration-700" style={{ background: isDark ? 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,26,0.3) 100%)' : 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.2) 100%)' }} />
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
      <div className={`relative z-10 flex-1 min-w-0 pl-3 ${hasBackgroundImage ? "drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]" : ""}`}>
        {renderRight ? (
          renderRight
        ) : (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2">
            <div
              className="px-3 py-1.5 rounded-lg backdrop-blur-md"
              style={{
                backgroundColor: isDark ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.9)",
                boxShadow: isDark ? "0 2px 8px -2px rgba(0, 0, 0, 0.3)" : "0 2px 8px -2px rgba(0, 0, 0, 0.1)",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              <p 
                className="text-xs font-medium truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {companyName || "Company"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
