import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type NotificationSettings, type BroadcastFilter } from '../api/settings-api';

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

export function useSendTestMessage() {
  return useMutation({
    mutationFn: () => settingsApi.sendTestMessage(),
  });
}

export function useBroadcast() {
  return useMutation({
    mutationFn: (data: { message: string; filter: BroadcastFilter }) =>
      settingsApi.broadcast(data),
  });
}

export function useRunDigest() {
  return useMutation({
    mutationFn: () => settingsApi.runDigest(),
  });
}

export function useDefaultWelcomeMessage() {
  return useQuery({
    queryKey: ['default-welcome-message'],
    queryFn: async () => {
      const res = await settingsApi.getDefaultWelcomeMessage();
      return res.data;
    },
  });
}
