import { apiClient } from '@/shared/lib/api-client';
import type {
  PlanVariant,
  CreatePlanVariantData,
  UpdatePlanVariantData,
  ApiResponse
} from '@/shared/types/common.types';

/**
 * Plan Variants API
 * Manages plan variant pricing/duration tiers
 */
export const planVariantsApi = {
  /**
   * Get all variants for a specific plan type
   * GET /api/v1/plans/types/:planTypeId/variants
   */
  getVariantsByPlanType: async (
    planTypeId: string,
    includeInactive = true
  ): Promise<ApiResponse<PlanVariant[]>> => {
    const response = await apiClient.get(`/plans/types/${planTypeId}/variants`, {
      params: { includeInactive }
    });
    return response.data;
  },

  /**
   * Get variant by ID
   * GET /api/v1/plans/variants/:id
   */
  getVariantById: async (id: string): Promise<ApiResponse<PlanVariant>> => {
    const response = await apiClient.get(`/plans/variants/${id}`);
    return response.data;
  },

  /**
   * Create a new variant for a plan type
   * POST /api/v1/plans/types/:planTypeId/variants
   * Admin only
   */
  createVariant: async (
    planTypeId: string,
    data: CreatePlanVariantData
  ): Promise<ApiResponse<PlanVariant>> => {
    const response = await apiClient.post(`/plans/types/${planTypeId}/variants`, data);
    return response.data;
  },

  /**
   * Update a variant
   * PATCH /api/v1/plans/variants/:id
   * Admin only
   */
  updateVariant: async (
    id: string,
    data: UpdatePlanVariantData
  ): Promise<ApiResponse<PlanVariant>> => {
    const response = await apiClient.patch(`/plans/variants/${id}`, data);
    return response.data;
  },

  /**
   * Delete a variant
   * DELETE /api/v1/plans/variants/:id
   * Admin only
   */
  deleteVariant: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/plans/variants/${id}`);
    return response.data;
  },

  /**
   * Deactivate a variant (soft delete)
   * PUT /api/v1/plans/variants/:id/deactivate
   * Admin only
   */
  deactivateVariant: async (id: string): Promise<ApiResponse<PlanVariant>> => {
    const response = await apiClient.put(`/plans/variants/${id}/deactivate`);
    return response.data;
  },
};
