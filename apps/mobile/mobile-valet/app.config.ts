import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  newArchEnabled: true,
  name: 'Parkit Valet',
  slug: 'parkit-valet',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon-1024.png',
  userInterfaceStyle: 'automatic',
  scheme: 'parkit-valet',
  backgroundColor: '#020617',
  splash: {
    image: './assets/icon-1024.png',
    resizeMode: 'contain',
    backgroundColor: '#020617',
  },
  platforms: ['ios', 'android', 'web'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.parkit.valet',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Usamos tu ubicación para mostrar el parqueo de la empresa más cercano.',
      NSPhotoLibraryUsageDescription:
        'Para elegir una foto de perfil desde tu galería.',
      NSCameraUsageDescription:
        'Para foto de perfil y para escanear códigos QR de reservas en recepción.',
    },
  },
  android: {
    icon: './assets/icon-1024.png',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon-foreground.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.parkit.valet',
    permissions: ['ACCESS_FINE_LOCATION', 'INTERNET', 'CAMERA'],
    softwareKeyboardLayoutMode: 'resize',
  },
  web: {
    bundler: 'metro',
    favicon: './assets/icon-48.png',
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
    [
      'expo-camera',
      {
        cameraPermission:
          'Permite escanear el QR de la reserva del cliente y usar la cámara si lo necesitas.',
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
      projectId: '2fa28315-fa61-46dc-add1-9f8d82c7d6d5',
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://parkit-valet-dev.onrender.com',
  },
});
