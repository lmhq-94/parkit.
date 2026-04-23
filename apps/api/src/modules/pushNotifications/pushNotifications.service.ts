import { prisma } from "../../shared/prisma";

interface SendPushNotificationDTO {
  title: string;
  body: string;
  userId: string;
}

export class PushNotificationsService {
  static async sendPushNotification(data: SendPushNotificationDTO) {
    try {
      // Get user's push token
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { pushToken: true },
      });

      if (!user?.pushToken) {
        console.log(`No push token found for user ${data.userId}`);
        return;
      }

      // Send push notification using Expo Push API
      const message = {
        to: user.pushToken,
        sound: 'default',
        title: data.title,
        body: data.body,
        data: { userId: data.userId },
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (result.data?.status === 'error') {
        console.error('Push notification error:', result.data.message);
        
        // If token is invalid, remove it from user
        if (result.data.message === 'DeviceNotRegistered') {
          await prisma.user.update({
            where: { id: data.userId },
            data: { pushToken: null },
          });
        }
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  static async updatePushToken(userId: string, pushToken: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });
  }
}
