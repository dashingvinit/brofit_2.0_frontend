import { apiClient } from '@/shared/lib/api-client';
import type {
  Training,
  CreateTrainingData,
  TrainingStats,
  TrainingDues,
  Payment,
  RecordTrainingPaymentData,
  ApiResponse,
} from '@/shared/types/common.types';

export interface GetAllTrainingsResponse extends ApiResponse<Training[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const trainingApi = {
  getAllTrainings: async (
    page = 1,
    limit = 100
  ): Promise<GetAllTrainingsResponse> => {
    const response = await apiClient.get('/trainings', {
      params: { page, limit },
    });
    return response.data;
  },

  getTrainingById: async (id: string): Promise<ApiResponse<Training>> => {
    const response = await apiClient.get(`/trainings/${id}`);
    return response.data;
  },

  getMemberTrainings: async (
    memberId: string
  ): Promise<ApiResponse<Training[]>> => {
    const response = await apiClient.get(`/trainings/member/${memberId}`);
    return response.data;
  },

  getActiveTraining: async (
    memberId: string
  ): Promise<ApiResponse<Training | null>> => {
    const response = await apiClient.get(
      `/trainings/member/${memberId}/active`
    );
    return response.data;
  },

  getTrainingStats: async (): Promise<ApiResponse<TrainingStats>> => {
    const response = await apiClient.get('/trainings/stats');
    return response.data;
  },

  createTraining: async (
    data: CreateTrainingData
  ): Promise<ApiResponse<Training>> => {
    const response = await apiClient.post('/trainings', data);
    return response.data;
  },

  updateTraining: async (
    id: string,
    data: { notes?: string; autoRenew?: boolean; endDate?: string; trainerId?: string }
  ): Promise<ApiResponse<Training>> => {
    const response = await apiClient.patch(`/trainings/${id}`, data);
    return response.data;
  },

  cancelTraining: async (id: string): Promise<ApiResponse<Training>> => {
    const response = await apiClient.put(`/trainings/${id}/cancel`);
    return response.data;
  },

  freezeTraining: async (id: string): Promise<ApiResponse<Training>> => {
    const response = await apiClient.put(`/trainings/${id}/freeze`);
    return response.data;
  },

  unfreezeTraining: async (id: string): Promise<ApiResponse<Training>> => {
    const response = await apiClient.put(`/trainings/${id}/unfreeze`);
    return response.data;
  },

  getTrainingDues: async (
    trainingId: string
  ): Promise<ApiResponse<TrainingDues>> => {
    const response = await apiClient.get(`/trainings/${trainingId}/dues`);
    return response.data;
  },

  recordPayment: async (
    data: RecordTrainingPaymentData
  ): Promise<ApiResponse<Payment>> => {
    const response = await apiClient.post('/trainings/payments', data);
    return response.data;
  },

  getExpiringTrainings: async (
    days = 7
  ): Promise<ApiResponse<Training[]>> => {
    const response = await apiClient.get('/trainings/expiring', {
      params: { days },
    });
    return response.data;
  },
};
