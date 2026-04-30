import { apiClient } from '@/shared/lib/api-client';

export type WhatsappConnection = {
  id: string;
  orgId: string;
  wabaId: string;
  phoneNumberId: string;
  displayName: string;
  phoneNumber: string;
  isConnected: boolean;
  credits: number;
  templatesCreated: boolean;
  createdAt: string;
};

type ApiResponse<T> = { success: boolean; data: T };

export const whatsappConnectApi = {
  getConnection: async (): Promise<ApiResponse<WhatsappConnection | null>> => {
    const res = await apiClient.get('/whatsapp/connection');
    return res.data;
  },

  connect: async (code: string): Promise<ApiResponse<WhatsappConnection>> => {
    const res = await apiClient.post('/whatsapp/connect', { code });
    return res.data;
  },

  disconnect: async (): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete('/whatsapp/connection');
    return res.data;
  },

  addCredits: async (amount: number): Promise<ApiResponse<{ credits: number }>> => {
    const res = await apiClient.post('/whatsapp/credits', { amount });
    return res.data;
  },
};
