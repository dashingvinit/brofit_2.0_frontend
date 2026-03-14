import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type NotificationSettings } from '../api/settings-api';

const QUERY_KEY = ['notification-settings'];

export function useNotificationSettings() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await settingsApi.getNotificationSettings();
      return res.data;
    },
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Omit<NotificationSettings, 'orgId'>>) =>
      settingsApi.updateNotificationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
