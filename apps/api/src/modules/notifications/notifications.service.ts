import { prisma } from "../../shared/prisma";
import { NotificationStatus, NotificationType } from "@prisma/client";

interface CreateNotificationDTO {
  title: string;
  body: string;
  type: NotificationType;
}

export class NotificationsService {
  static async listByUser(userId: string) {
    return prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notificationLog.count({
      where: {
        userId,
        status: { not: NotificationStatus.READ },
      },
    });
  }

  static async markAsRead(notificationId: string) {
    return prisma.notificationLog.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.READ,
      },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notificationLog.updateMany({
      where: { userId },
      data: {
        status: NotificationStatus.READ,
      },
    });
  }

  static async delete(notificationId: string) {
    return prisma.notificationLog.delete({
      where: { id: notificationId },
    });
  }

  static async create(
    userId: string,
    data: CreateNotificationDTO
  ) {
    return prisma.notificationLog.create({
      data: {
        userId,
        title: data.title,
        body: data.body,
        type: data.type,
      },
    });
  }
}
