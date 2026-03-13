import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  newArchEnabled: true,
  name: "Parkit Client",
  slug: "parkit-customer",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "parkit",
  userInterfaceStyle: "automatic",
  backgroundColor: "#020617",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#020617",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTabletMode: true,
    bundleIdentifier: "com.paradoxialabs.parkit.customer",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.paradoxialabs.parkit.customer",
  },
  web: {
    favicon: "./assets/favicon.png",
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
  extra: {
    eas: {
      projectId: "parkit-customer",
    },
  },
  experiments: {
    typedRoutes: true,
  },
});
