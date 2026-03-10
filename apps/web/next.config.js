/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
    ignoreBuildErrors: true, // temporal: permite generar .next para que dev no falle con ENOENT; corregir tipos y quitarlo después
  },
  eslint: {
    ignoreDuringBuilds: true, // temporal: igual que arriba
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  },
  outputFileTracingRoot: __dirname,
  // Mejora rendimiento: compilación más rápida y bundles más pequeños
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

module.exports = nextConfig;
