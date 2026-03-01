import { apiClient } from '@/shared/lib/api-client';
import type { Trainer, ApiResponse } from '@/shared/types/common.types';

export const trainersApi = {
  /**
   * Get all trainers in the organization
   * GET /api/v1/trainers
   */
  getAllTrainers: async (): Promise<ApiResponse<Trainer[]>> => {
    const response = await apiClient.get('/trainers');
    return response.data;
  },

  /**
   * Create a new trainer
   * POST /api/v1/trainers
   */
  createTrainer: async (name: string): Promise<ApiResponse<Trainer>> => {
    const response = await apiClient.post('/trainers', { name });
    return response.data;
  },

  /**
   * Deactivate a trainer
   * PUT /api/v1/trainers/:id/deactivate
   */
  deactivateTrainer: async (trainerId: string): Promise<ApiResponse<Trainer>> => {
    const response = await apiClient.put(`/trainers/${trainerId}/deactivate`);
    return response.data;
  },
};
