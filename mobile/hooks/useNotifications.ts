import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService, type NotificationParams } from '@/services/notification.service';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  list: (params: NotificationParams) => [...NOTIFICATION_KEYS.all, 'list', params] as const,
};

/**
 * Hook to fetch notifications with pagination
 */
export function useNotifications(params: NotificationParams = {}) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => NotificationService.getNotifications(params),
  });
}

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}
