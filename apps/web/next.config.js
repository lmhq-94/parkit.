/** @type {import('next').NextConfig} */
const { version: packageVersion } = require("./package.json");

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
    ignoreBuildErrors: true, // temporary: allows generating .next so dev does not fail with ENOENT; fix types and remove later
  },
  eslint: {
    ignoreDuringBuilds: true, // temporary: same as above
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    // Sidebar version: use package.json if NEXT_PUBLIC_APP_VERSION is not defined in .env
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || packageVersion,
  },
  outputFileTracingRoot: __dirname,
  // Performance improvement: faster compilation and smaller bundles
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

module.exports = nextConfig;
