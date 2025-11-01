import api from './api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'SYSTEM' | 'BUDGET_ALERT' | 'ACHIEVEMENT' | 'EXPENSE_SPLIT';
  read: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export const notificationService = {
  /**
   * Get all notifications for current user
   */
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get<Notification[]>('/notifications');
    return data;
  },

  /**
   * Get only unread notifications
   */
  getUnread: async (): Promise<Notification[]> => {
    const { data } = await api.get<Notification[]>('/notifications/unread');
    return data;
  },

  /**
   * Get unread count (for badge)
   */
  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<UnreadCountResponse>('/notifications/unread/count');
    return data.count;
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  /**
   * Create a test notification (for testing)
   */
  createTestNotification: async (): Promise<void> => {
    await api.post('/notifications/test');
  },
};

