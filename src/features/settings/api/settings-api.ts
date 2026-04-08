import { apiClient } from '@/shared/lib/api-client';

export type NotificationSettings = {
  orgId: string;
  ownerWhatsapp: string | null;
  digestEnabled: boolean;
  memberReminderEnabled: boolean;
  reminderDaysBefore: number;
  welcomeEnabled: boolean;
  welcomeMessage: string | null;
  duesReminderEnabled: boolean;
  duesReminderDaysOld: number;
};

export type BroadcastFilter = 'all' | 'active' | 'expiring';

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

  sendTestMessage: async (): Promise<ApiResponse<{ sent: boolean }>> => {
    const response = await apiClient.post('/notifications/test');
    return response.data;
  },

  broadcast: async (data: {
    message: string;
    filter: BroadcastFilter;
  }): Promise<ApiResponse<{ sent: number; failed: number; skipped: number; total: number }>> => {
    const response = await apiClient.post('/notifications/broadcast', data);
    return response.data;
  },

  runDigest: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/notifications/run-digest');
    return response.data;
  },

  getDefaultWelcomeMessage: async (): Promise<ApiResponse<string>> => {
    const response = await apiClient.get('/notifications/default-welcome');
    return response.data;
  },

  sendWelcomeToAll: async (): Promise<ApiResponse<{ sent: number; failed: number; total: number }>> => {
    const response = await apiClient.post('/notifications/send-welcome-all');
    return response.data;
  },

  getWelcomeStatus: async (): Promise<ApiResponse<{ notSent: number; sentNotOptedIn: number; optedIn: number; total: number }>> => {
    const response = await apiClient.get('/notifications/welcome-status');
    return response.data;
  },

  resetWelcome: async (memberIds?: string[]): Promise<ApiResponse<{ reset: number }>> => {
    const response = await apiClient.post('/notifications/reset-welcome', memberIds ? { memberIds } : {});
    return response.data;
  },

  pingMember: async (memberId: string, type: 'dues' | 'no-subscription'): Promise<ApiResponse<{ sent: boolean; type: string }>> => {
    const response = await apiClient.post(`/notifications/ping/${memberId}`, { type });
    return response.data;
  },
};
