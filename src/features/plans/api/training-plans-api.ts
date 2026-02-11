import { apiClient } from '@/shared/lib/api-client';
import type { TrainingPlan, TrainingPlanInstance, ApiResponse } from '@/shared/types/common.types';

/**
 * Training Plans API
 * Handles both training plan catalog management and user training assignments
 */
export const trainingPlansApi = {
  // ==================== Plan Catalog Management ====================

  /**
   * Get active training plans with optional category filter
   * GET /api/v1/plans/trainings?category=weight-training
   */
  getActivePlans: async (category?: string): Promise<ApiResponse<TrainingPlan[]>> => {
    const response = await apiClient.get('/plans/trainings', {
      params: category ? { category } : undefined,
    });
    return response.data;
  },

  /**
   * Get all training plans (including inactive)
   * GET /api/v1/plans/trainings/all
   * Admin only
   */
  getAllPlans: async (): Promise<ApiResponse<TrainingPlan[]>> => {
    const response = await apiClient.get('/plans/trainings/all');
    return response.data;
  },

  /**
   * Get training plan by ID
   * GET /api/v1/plans/trainings/:id
   */
  getPlanById: async (planId: string): Promise<ApiResponse<TrainingPlan>> => {
    const response = await apiClient.get(`/plans/trainings/${planId}`);
    return response.data;
  },

  /**
   * Create a new training plan
   * POST /api/v1/plans/trainings
   * Admin only
   */
  createPlan: async (planData: {
    name: string;
    description?: string;
    category: "weight-training" | "cardio" | "yoga" | "crossfit" | "personal-training" | "group-class" | "other";
    durationDays?: number;
    sessionsPerWeek?: number;
    price: number;
    features: string[];
    requiresTrainer: boolean;
  }): Promise<ApiResponse<TrainingPlan>> => {
    const response = await apiClient.post('/plans/trainings', planData);
    return response.data;
  },

  /**
   * Update a training plan
   * PATCH /api/v1/plans/trainings/:id
   * Admin only
   */
  updatePlan: async (
    planId: string,
    planData: Partial<{
      name: string;
      description?: string;
      category: "weight-training" | "cardio" | "yoga" | "crossfit" | "personal-training" | "group-class" | "other";
      durationDays: number;
      sessionsPerWeek: number;
      price: number;
      features: string[];
      requiresTrainer: boolean;
    }>
  ): Promise<ApiResponse<TrainingPlan>> => {
    const response = await apiClient.patch(`/plans/trainings/${planId}`, planData);
    return response.data;
  },

  /**
   * Deactivate a training plan (soft delete)
   * DELETE /api/v1/plans/trainings/:id
   * Admin only
   */
  deactivatePlan: async (planId: string): Promise<ApiResponse<TrainingPlan>> => {
    const response = await apiClient.delete(`/plans/trainings/${planId}`);
    return response.data;
  },

  // ==================== User Training Management ====================
  // These operate on the embedded trainingPlans array within User documents

  /**
   * Add training plan to user
   * POST /api/v1/users/:id/trainings
   * Admin only
   */
  addTrainingToUser: async (
    userId: string,
    trainingData: {
      planId?: string;
      planName: string;
      trainerId?: string;
      trainerName?: string;
      startDate: string;
      endDate?: string;
      status: "active" | "completed" | "cancelled";
      sessionsPerWeek?: number;
      notes?: string;
    }
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/users/${userId}/trainings`, trainingData);
    return response.data;
  },

  /**
   * Update user's training plan
   * PATCH /api/v1/users/:id/trainings/:trainingId
   * Admin only
   */
  updateUserTraining: async (
    userId: string,
    trainingId: string,
    updateData: Partial<{
      trainerId: string;
      trainerName: string;
      startDate: string;
      endDate: string;
      status: "active" | "completed" | "cancelled";
      sessionsPerWeek: number;
      notes: string;
    }>
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(
      `/users/${userId}/trainings/${trainingId}`,
      updateData
    );
    return response.data;
  },

  /**
   * Remove training plan from user
   * DELETE /api/v1/users/:id/trainings/:trainingId
   * Admin only
   */
  removeUserTraining: async (
    userId: string,
    trainingId: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/users/${userId}/trainings/${trainingId}`);
    return response.data;
  },
};
