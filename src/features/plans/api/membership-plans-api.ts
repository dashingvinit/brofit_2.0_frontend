import { apiClient } from '@/shared/lib/api-client';
import type { MembershipPlan, ApiResponse } from '@/shared/types/common.types';

/**
 * Membership Plans API
 * Handles both plan catalog management and user membership assignments
 */
export const membershipPlansApi = {
  // ==================== Plan Catalog Management ====================

  /**
   * Get active membership plans
   * GET /api/v1/plans/memberships
   */
  getActivePlans: async (): Promise<ApiResponse<MembershipPlan[]>> => {
    const response = await apiClient.get('/plans/memberships');
    return response.data;
  },

  /**
   * Get all membership plans (including inactive)
   * GET /api/v1/plans/memberships/all
   * Admin only
   */
  getAllPlans: async (): Promise<ApiResponse<MembershipPlan[]>> => {
    const response = await apiClient.get('/plans/memberships/all');
    return response.data;
  },

  /**
   * Get membership plan by ID
   * GET /api/v1/plans/memberships/:id
   */
  getPlanById: async (planId: string): Promise<ApiResponse<MembershipPlan>> => {
    const response = await apiClient.get(`/plans/memberships/${planId}`);
    return response.data;
  },

  /**
   * Create a new membership plan
   * POST /api/v1/plans/memberships
   * Admin only
   */
  createPlan: async (planData: {
    name: string;
    description?: string;
    durationDays: number;
    price: number;
    features: string[];
  }): Promise<ApiResponse<MembershipPlan>> => {
    const response = await apiClient.post('/plans/memberships', planData);
    return response.data;
  },

  /**
   * Update a membership plan
   * PATCH /api/v1/plans/memberships/:id
   * Admin only
   */
  updatePlan: async (
    planId: string,
    planData: Partial<{
      name: string;
      description?: string;
      durationDays: number;
      price: number;
      features: string[];
    }>
  ): Promise<ApiResponse<MembershipPlan>> => {
    const response = await apiClient.patch(`/plans/memberships/${planId}`, planData);
    return response.data;
  },

  /**
   * Deactivate a membership plan (soft delete)
   * DELETE /api/v1/plans/memberships/:id
   * Admin only
   */
  deactivatePlan: async (planId: string): Promise<ApiResponse<MembershipPlan>> => {
    const response = await apiClient.delete(`/plans/memberships/${planId}`);
    return response.data;
  },

  // ==================== User Membership Management ====================
  // These operate on the embedded membershipPlans array within User documents

  /**
   * Add membership plan to user
   * POST /api/v1/users/:id/memberships
   * Admin only
   */
  addMembershipToUser: async (
    userId: string,
    membershipData: {
      planId: string;
      planName: string;
      startDate: string;
      endDate: string;
      status: "active" | "expired" | "cancelled";
      amountPaid?: number;
      paymentReference?: string;
    }
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/users/${userId}/memberships`, membershipData);
    return response.data;
  },

  /**
   * Update user's membership plan
   * PATCH /api/v1/users/:id/memberships/:membershipId
   * Admin only
   */
  updateUserMembership: async (
    userId: string,
    membershipId: string,
    updateData: Partial<{
      startDate: string;
      endDate: string;
      status: "active" | "expired" | "cancelled";
      amountPaid: number;
      paymentReference: string;
    }>
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(
      `/users/${userId}/memberships/${membershipId}`,
      updateData
    );
    return response.data;
  },

  /**
   * Remove membership plan from user
   * DELETE /api/v1/users/:id/memberships/:membershipId
   * Admin only
   */
  removeUserMembership: async (
    userId: string,
    membershipId: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/users/${userId}/memberships/${membershipId}`);
    return response.data;
  },
};
