"use client";

import Image from "next/image";

/**
 * Banner estilo Microsoft/Google: avatar/logo en círculo a la izquierda
 * y nombre de empresa a la derecha. Misma estructura con o sin imagen de fondo.
 */
export function DefaultBanner({
  companyName,
  logoImageUrl,
  initials,
  isDark,
  backgroundImageUrl,
  subtitle,
  className = "",
  renderRight,
}: {
  companyName: string;
  logoImageUrl?: string | null;
  initials: string;
  isDark: boolean;
  /** Si se indica, se usa como fondo manteniendo el mismo layout (nombre + avatar). */
  backgroundImageUrl?: string | null;
  /** Línea de texto sutil debajo del nombre (opcional). */
  subtitle?: string;
  className?: string;
  /** Contenido personalizado en la parte derecha. Si se indica, reemplaza título/subtítulo por este nodo. */
  renderRight?: React.ReactNode;
}) {
  const hasBackgroundImage = Boolean(backgroundImageUrl?.trim());

  return (
    <div
      className={`relative overflow-hidden w-full aspect-[5/1] min-h-[5rem] flex items-center ${className}`}
      style={{
        backgroundColor: hasBackgroundImage ? undefined : isDark ? "#1a1a1a" : "#f8f9fa",
      }}
    >
      {hasBackgroundImage && (
        <>
          <Image
            src={backgroundImageUrl!}
            alt=""
            width={1000}
            height={200}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" aria-hidden />
        </>
      )}
      {!hasBackgroundImage && (
        <>
          <div
            className="absolute bottom-0 right-0 w-full h-full pointer-events-none"
            style={{
              background: isDark
                ? "linear-gradient(165deg, transparent 45%, rgba(59, 130, 246, 0.12) 45%, rgba(59, 130, 246, 0.08) 55%, transparent 55%)"
                : "linear-gradient(165deg, transparent 45%, rgba(59, 130, 246, 0.08) 45%, rgba(59, 130, 246, 0.04) 55%, transparent 55%)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-1/2 h-full pointer-events-none opacity-80"
            style={{
              background: isDark
                ? "linear-gradient(150deg, transparent 50%, rgba(30, 58, 138, 0.15) 50%)"
                : "linear-gradient(150deg, transparent 50%, rgba(147, 197, 253, 0.2) 50%)",
            }}
          />
        </>
      )}

      {/* Izquierda: círculo con avatar/logo */}
      <div className={`relative z-10 shrink-0 pl-4 ${hasBackgroundImage ? "drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]" : ""}`}>
        <div
          className="w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center text-sm font-semibold"
          style={{
            backgroundColor: isDark ? "#2d2d2d" : "#ffffff",
            borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)",
            color: isDark ? "#e5e5e5" : "#374151",
          }}
        >
          {logoImageUrl?.trim() ? (
            <Image
              src={logoImageUrl}
              alt=""
              width={48}
              height={48}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </div>

      {/* Derecha: o bien título/subtítulo por defecto o contenido personalizado (ej. selector) */}
      <div className={`relative z-10 flex-1 min-w-0 pl-3 pr-4 ${hasBackgroundImage ? "drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : ""}`}>
        {renderRight ? (
          renderRight
        ) : (
          <>
            <p
              className="text-sm font-semibold truncate tracking-tight"
              style={{
                color: isDark ? "rgba(255,255,255,0.95)" : "#1a1a1a",
              }}
            >
              {companyName || "Company"}
            </p>
            {subtitle && (
              <p
                className="mt-0.5 text-[11px] truncate"
                style={{
                  color: isDark ? "rgba(226,232,240,0.8)" : "rgba(15,23,42,0.65)",
                }}
              >
                {subtitle}
              </p>
            )}
            <div
              className="mt-1.5 w-8 h-0.5 rounded-sm"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
