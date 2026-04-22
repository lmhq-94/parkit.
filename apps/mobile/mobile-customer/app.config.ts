import { ExpoConfig, ConfigContext } from "expo/config";
import packageJson from "./package.json";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  newArchEnabled: true,
  name: "Parkit Client",
  slug: "parkit-client",
  version: packageJson.version,
  orientation: "portrait",
  icon: "./assets/icon-1024.png",
  userInterfaceStyle: "automatic",
  scheme: "parkit-client",
  backgroundColor: "#020617",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#020617",
  },
  platforms: ['ios', 'android', 'web'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.parkit.client",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon-foreground.png",
      backgroundColor: "#FFFFFF",
    },
    package: "com.parkit.client",
  },
  web: {
    favicon: "./assets/icon-48.png",
  },
  plugins: [
    [
      "expo-router",
      {
        origin: undefined,
      },
    ],
    [
      "expo-secure-store",
      {
        faceIDPermission: "Allow $(PRODUCT_NAME) to access your face ID",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  updates: {
    enabled: false,
    checkAutomatically: 'NEVER',
  },
  extra: {
    eas: {
      projectId: "4b8f3d34-4520-4029-aad8-b3760cbe7b2f",
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://parkit-api-dev.onrender.com",
  },
});
