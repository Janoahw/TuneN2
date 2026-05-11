import { api } from './api';
import { ENDPOINTS } from './endpoints';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, any> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface NotificationParams {
  page?: number;
  limit?: number;
}

/**
 * Notification service for fetching and managing notifications
 */
export class NotificationService {
  /**
   * Get paginated list of notifications
   */
  static async getNotifications(params: NotificationParams = {}): Promise<NotificationsResponse> {
    const response = await api.get(ENDPOINTS.notifications.list, {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
      },
    });
    return response.data.data;
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId: string) {
    const response = await api.patch(ENDPOINTS.notifications.markRead(notificationId));
    return response.data.data;
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead() {
    const response = await api.patch(ENDPOINTS.notifications.markAllRead);
    return response.data.data;
  }
}
