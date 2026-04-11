import { apiClient } from '@/shared/lib/api-client';
import type {
  Trainer,
  TrainerWithClients,
  Training,
  ApiResponse,
  TrainerPayoutSchedule,
  TrainerPayoutRecord,
  TrainerOutstandingSummary,
  RecordTrainerPayoutData,
} from '@/shared/types/common.types';

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
  createTrainer: async (data: { name: string; splitPercent?: number }): Promise<ApiResponse<Trainer>> => {
    const response = await apiClient.post('/trainers', data);
    return response.data;
  },

  updateTrainer: async (trainerId: string, data: { name?: string; splitPercent?: number }): Promise<ApiResponse<Trainer>> => {
    const response = await apiClient.patch(`/trainers/${trainerId}`, data);
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

  /**
   * Get a trainer with their active clients
   * GET /api/v1/trainers/:id/clients
   */
  getTrainerWithClients: async (trainerId: string): Promise<ApiResponse<TrainerWithClients>> => {
    const response = await apiClient.get(`/trainers/${trainerId}/clients`);
    return response.data;
  },

  /**
   * Get per-client, per-month payout schedule for a trainer
   * GET /api/v1/trainers/:id/payout-schedule
   */
  getPayoutSchedule: async (trainerId: string): Promise<ApiResponse<TrainerPayoutSchedule>> => {
    const response = await apiClient.get(`/trainers/${trainerId}/payout-schedule`);
    return response.data;
  },

  /**
   * Record a cash payout for a specific client-month
   * POST /api/v1/trainers/:id/payouts
   */
  recordPayout: async (
    trainerId: string,
    data: RecordTrainerPayoutData,
  ): Promise<ApiResponse<TrainerPayoutRecord>> => {
    const response = await apiClient.post(`/trainers/${trainerId}/payouts`, data);
    return response.data;
  },

  /**
   * Delete (unmark) a payout for a specific client-month
   * DELETE /api/v1/trainers/:id/payouts
   */
  deletePayout: async (
    trainerId: string,
    data: { trainingId: string; month: number; year: number },
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/trainers/${trainerId}/payouts`, { data });
    return response.data;
  },

  /**
   * Backfill missing expense records for old payouts
   * POST /api/v1/trainers/backfill-expenses
   */
  backfillExpenses: async (): Promise<ApiResponse<{ backfilled: number }>> => {
    const response = await apiClient.post('/trainers/backfill-expenses');
    return response.data;
  },

  /**
   * Get payout history for a trainer
   * GET /api/v1/trainers/:id/payout-history
   */
  getPayoutHistory: async (trainerId: string): Promise<ApiResponse<TrainerPayoutRecord[]>> => {
    const response = await apiClient.get(`/trainers/${trainerId}/payout-history`);
    return response.data;
  },

  /**
   * Get outstanding payout totals for all trainers in org
   * GET /api/v1/trainers/payout-summary
   */
  getOutstandingSummary: async (): Promise<ApiResponse<TrainerOutstandingSummary>> => {
    const response = await apiClient.get('/trainers/payout-summary');
    return response.data;
  },

  /**
   * Get all trainings (assignment history) for a trainer
   * GET /api/v1/trainers/:id/history
   */
  getAssignmentHistory: async (trainerId: string): Promise<ApiResponse<Training[]>> => {
    const response = await apiClient.get(`/trainers/${trainerId}/history`);
    return response.data;
  },
};
