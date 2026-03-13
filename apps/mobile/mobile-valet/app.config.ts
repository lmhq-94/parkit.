import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  newArchEnabled: true,
  name: 'ParKit Valet',
  slug: 'parkit-valet',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'parkit-valet',
  backgroundColor: '#020617',
  splash: {
    image: './assets/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#020617',
  },
  platforms: ['ios', 'android', 'web'],
  ios: {
    supportsTabletMode: false,
    bundleIdentifier: 'com.parkit.valet',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.parkit.valet',
    permissions: ['ACCESS_FINE_LOCATION', 'INTERNET'],
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
  eas: {
    projectId: 'parkit-valet-prod',
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000',
  },
});
