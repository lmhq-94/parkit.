import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from './api';

// Check if running in Expo Go (not a development build)
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notification handler only if not in Expo Go
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function usePushNotifications(userId: string | undefined) {
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  const registerForPushNotificationsAsync = useCallback(async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Send token to backend
    if (token && userId) {
      try {
        await api.patch('/users/me', { pushToken: token });
      } catch (error) {
        console.error('Error saving push token:', error);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Skip push notifications in Expo Go (not fully supported since SDK 53)
    if (isExpoGo) return;

    // Request permissions
    registerForPushNotificationsAsync();

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // Notification received
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (_response) => {
        // Notification response received
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId, registerForPushNotificationsAsync]);
}
