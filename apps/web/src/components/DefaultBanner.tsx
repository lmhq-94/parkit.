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
  subtitle: _subtitle,
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
        <div className="absolute inset-0 overflow-hidden">
          {/* Base gradient */}
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a1a 100%)'
                : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0f2fe 75%, #f0f9ff 100%)',
            }}
          />

          {/* Blob shapes - scaled for sidebar banner (smaller, slower constant movement) */}
          <div className="absolute top-0 left-0 w-[120px] h-[120px]" style={{ background: isDark ? 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(12px)', opacity: isDark ? 0.6 : 0.7, animation: 'lava-morph-1 60s ease-in-out infinite' }} />
          <div className="absolute top-1/4 right-0 w-[100px] h-[100px]" style={{ background: isDark ? 'linear-gradient(225deg, #3730a3 0%, #4338ca 50%, #1e3a5f 100%)' : 'linear-gradient(225deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', filter: 'blur(10px)', opacity: isDark ? 0.5 : 0.65, animation: 'lava-morph-2 75s ease-in-out infinite' }} />
          <div className="absolute bottom-0 left-1/4 w-[80px] h-[80px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)' : 'linear-gradient(45deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)', borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%', filter: 'blur(15px)', opacity: isDark ? 0.55 : 0.75, animation: 'lava-morph-3 66s ease-in-out infinite' }} />
          <div className="absolute top-1/2 right-1/4 w-[70px] h-[70px]" style={{ background: isDark ? 'linear-gradient(315deg, #4338ca 0%, #3730a3 50%, #312e81 100%)' : 'linear-gradient(315deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', filter: 'blur(11px)', opacity: isDark ? 0.45 : 0.6, animation: 'lava-morph-4 54s ease-in-out infinite' }} />
          <div className="absolute bottom-1/4 left-0 w-[60px] h-[60px]" style={{ background: isDark ? 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', borderRadius: '50% 50% 40% 60% / 50% 40% 60% 50%', filter: 'blur(9px)', opacity: isDark ? 0.4 : 0.6, animation: 'lava-morph-5 72s ease-in-out infinite' }} />
          <div className="absolute top-1/4 right-1/5 w-[50px] h-[50px]" style={{ background: isDark ? 'linear-gradient(180deg, #4c1d95 0%, #5b21b6 50%, #312e81 100%)' : 'linear-gradient(180deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)', borderRadius: '60% 40% 70% 30% / 40% 60% 30% 70%', filter: 'blur(8px)', opacity: isDark ? 0.35 : 0.65, animation: 'lava-morph-6 84s ease-in-out infinite' }} />
          <div className="absolute bottom-0 left-1/3 w-[40px] h-[40px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e3a8a 0%, #3730a3 100%)' : 'linear-gradient(45deg, #2563eb 0%, #3b82f6 100%)', borderRadius: '40% 60% 50% 50% / 50% 40% 50% 60%', filter: 'blur(7px)', opacity: isDark ? 0.3 : 0.55, animation: 'lava-morph-7 90s ease-in-out infinite' }} />

          {/* Overlay */}
          <div className="absolute inset-0 transition-all duration-700" style={{ background: isDark ? 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,26,0.4) 100%)' : 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)' }} />
        </div>
      )}

      {/* Izquierda: avatar/logo o icono de industria - estilo consistente con perfil */}
      <div className={`relative z-10 shrink-0 pl-4 ${hasBackgroundImage ? "drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" : ""}`}>
        <div
          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: '3px solid var(--card-border)',
            boxShadow: `0 8px 32px -8px ${companyColors?.primary ? companyColors.primary + '40' : 'rgba(0,0,0,0.1)'}`,
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
            <IndustryIcon className="w-[18px] h-[18px]" strokeWidth={2} style={{ color: companyColors?.primary }} />
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
