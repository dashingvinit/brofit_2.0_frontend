import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { whatsappConnectApi } from '../api/whatsapp-connect.api';

const QUERY_KEY = ['whatsapp-connection'];

export function useWhatsappConnection() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await whatsappConnectApi.getConnection();
      return res.data;
    },
  });
}

export function useConnectWhatsapp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => whatsappConnectApi.connect(code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDisconnectWhatsapp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => whatsappConnectApi.disconnect(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useAddCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => whatsappConnectApi.addCredits(amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
