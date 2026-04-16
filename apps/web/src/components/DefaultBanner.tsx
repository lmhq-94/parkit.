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
            width={1000}
            height={200}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" aria-hidden />
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
      <div className={`relative z-10 shrink-0 pl-4 ${hasBackgroundImage ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" : ""}`}>
        <div
          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: logoImageUrl?.trim()
              ? (isDark ? "rgba(30,41,59,0.8)" : "#ffffff")
              : (isDark ? "hsla(220, 10%, 35%, 1)" : "hsla(220, 10%, 88%, 1)"),
            border: logoImageUrl?.trim()
              ? (isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.06)")
              : `2px solid ${isDark ? "hsla(220, 15%, 45%, 0.4)" : "hsla(220, 15%, 75%, 0.6)"}`,
            boxShadow: logoImageUrl?.trim()
              ? (isDark
                  ? "0 4px 12px -2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
                  : "0 4px 12px -2px rgba(0,0,0,0.1), 0 1px 2px rgba(255,255,255,1) inset")
              : "0 2px 8px -2px rgba(0,0,0,0.08)",
            color: isDark ? "#e2e8f0" : "#475569",
          }}
        >
          {logoImageUrl?.trim() ? (
            <Image
              src={logoImageUrl}
              alt=""
              width={36}
              height={36}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <IndustryIcon className="w-[18px] h-[18px]" strokeWidth={1.5} />
          )}
        </div>
      </div>

      {/* Derecha: contenido personalizado o título premium */}
      <div className={`relative z-10 flex-1 min-w-0 pl-3 pr-4 flex justify-center ${hasBackgroundImage ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" : ""}`}>
        {renderRight ? (
          renderRight
        ) : (
          <div
            className="inline-flex flex-col gap-0.5 rounded-lg px-4 py-2 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: isDark 
                ? "rgba(15,23,42,0.6)" 
                : "rgba(255,255,255,0.7)",
              border: isDark
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(255,255,255,0.8)",
              boxShadow: isDark
                ? "0 8px 32px -8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 8px 32px -8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1)",
            }}
          >
            <p className="text-sm font-bold truncate tracking-tight text-text-primary drop-shadow-sm">
              {companyName || "Company"}
            </p>
            {subtitle && (
              <p className="text-[11px] truncate font-semibold tracking-wide text-text-muted/80">
                {subtitle}
              </p>
            )}
            {/* Indicador premium sutil */}
            <div
              className="mt-1.5 w-10 h-0.5 rounded-full"
              style={{
                background: isDark
                  ? "linear-gradient(90deg, rgba(59,130,246,0.6), rgba(139,92,246,0.4))"
                  : "linear-gradient(90deg, rgba(59,130,246,0.4), rgba(139,92,246,0.3))",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
