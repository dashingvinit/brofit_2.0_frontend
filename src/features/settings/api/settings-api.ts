import { apiClient } from '@/shared/lib/api-client';

export type NotificationSettings = {
  orgId: string;
  ownerWhatsapp: string | null;
  digestEnabled: boolean;
  memberReminderEnabled: boolean;
  reminderDaysBefore: number;
};

type ApiResponse<T> = { success: boolean; data: T };

export const settingsApi = {
  getNotificationSettings: async (): Promise<ApiResponse<NotificationSettings>> => {
    const response = await apiClient.get('/notifications/settings');
    return response.data;
  },

  updateNotificationSettings: async (
    data: Partial<Omit<NotificationSettings, 'orgId'>>
  ): Promise<ApiResponse<NotificationSettings>> => {
    const response = await apiClient.patch('/notifications/settings', data);
    return response.data;
  },
};
