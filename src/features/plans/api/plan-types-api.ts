import { apiClient } from '@/shared/lib/api-client';
import type {
  PlanType,
  PlanCategory,
  CreatePlanTypeData,
  UpdatePlanTypeData,
  ApiResponse
} from '@/shared/types/common.types';

/**
 * Plan Types API
 * Manages plan type catalog (e.g., Cardio, Strength, Yoga)
 */
export const planTypesApi = {
  /**
   * Get active plan types
   * GET /api/v1/plans/types
   */
  getActivePlanTypes: async (category?: PlanCategory): Promise<ApiResponse<PlanType[]>> => {
    const response = await apiClient.get('/plans/types', {
      params: category ? { category } : undefined,
    });
    return response.data;
  },

  /**
   * Get all plan types (including inactive)
   * GET /api/v1/plans/types/all
   * Admin only
   */
  getAllPlanTypes: async (): Promise<ApiResponse<PlanType[]>> => {
    const response = await apiClient.get('/plans/types/all');
    return response.data;
  },

  /**
   * Get plan type by ID (with variants)
   * GET /api/v1/plans/types/:id
   */
  getPlanTypeById: async (id: string): Promise<ApiResponse<PlanType>> => {
    const response = await apiClient.get(`/plans/types/${id}`);
    return response.data;
  },

  /**
   * Create a new plan type
   * POST /api/v1/plans/types
   * Admin only
   */
  createPlanType: async (data: CreatePlanTypeData): Promise<ApiResponse<PlanType>> => {
    // `data` now contains a `category` property (membership|training).
    // the backend uses this field to set the plan's category, defaulting
    // to "membership" if it's missing.  Having it in the interface
    // guarantees we can't accidentally omit it in the future.
    const response = await apiClient.post('/plans/types', data);
    return response.data;
  },

  /**
   * Update a plan type
   * PATCH /api/v1/plans/types/:id
   * Admin only
   */
  updatePlanType: async (
    id: string,
    data: UpdatePlanTypeData
  ): Promise<ApiResponse<PlanType>> => {
    const response = await apiClient.patch(`/plans/types/${id}`, data);
    return response.data;
  },

  /**
   * Delete a plan type
   * DELETE /api/v1/plans/types/:id
   * Admin only
   */
  deletePlanType: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/plans/types/${id}`);
    return response.data;
  },

  /**
   * Deactivate a plan type (soft delete)
   * PUT /api/v1/plans/types/:id/deactivate
   * Admin only
   */
  deactivatePlanType: async (id: string): Promise<ApiResponse<PlanType>> => {
    const response = await apiClient.put(`/plans/types/${id}/deactivate`);
    return response.data;
  },
};
