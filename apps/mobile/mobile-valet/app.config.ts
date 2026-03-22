import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  newArchEnabled: true,
  name: 'Parkit Valet',
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
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Usamos tu ubicación para mostrar el parqueo de la empresa más cercano.',
      NSPhotoLibraryUsageDescription:
        'Para elegir una foto de perfil desde tu galería.',
      NSCameraUsageDescription: 'Para tomar una foto de perfil si lo prefieres.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.parkit.valet',
    permissions: ['ACCESS_FINE_LOCATION', 'INTERNET'],
    /** Permite redimensionar la ventana con el teclado (junto con adjustResize en el manifest). */
    softwareKeyboardLayoutMode: 'resize',
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Permite mostrar el parqueo más cercano según tu posición.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Necesitamos acceso a tus fotos para que puedas elegir una imagen de perfil.',
        cameraPermission:
          'Si lo deseas, puedes tomarte una foto para tu perfil.',
      },
    ],
    '@react-native-community/datetimepicker',
  ],
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
