import { apiClient } from '@/shared/lib/api-client';
import type { MembershipPlan, UserMembership, ApiResponse } from '@/shared/types/common.types';

export const membershipsApi = {
  /**
   * Get active membership plans
   */
  getActivePlans: async (): Promise<ApiResponse<MembershipPlan[]>> => {
    const response = await apiClient.get('/memberships/plans');
    return response.data;
  },

  /**
   * Get all membership plans (including inactive)
   */
  getAllPlans: async (): Promise<ApiResponse<MembershipPlan[]>> => {
    const response = await apiClient.get('/memberships/plans/all');
    return response.data;
  },

  /**
   * Get plan statistics
   */
  getPlanStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/memberships/plans/stats');
    return response.data;
  },

  /**
   * Get plan by ID
   */
  getPlanById: async (planId: string): Promise<ApiResponse<MembershipPlan>> => {
    const response = await apiClient.get(`/memberships/plans/${planId}`);
    return response.data;
  },

  /**
   * Create a new membership plan
   */
  createPlan: async (planData: {
    name: string;
    description?: string;
    durationDays: number;
    price: number;
    features: string[];
  }): Promise<ApiResponse<MembershipPlan>> => {
    const response = await apiClient.post('/memberships/plans', planData);
    return response.data;
  },

  /**
   * Update a membership plan
   */
  updatePlan: async (
    planId: string,
    planData: Partial<{
      name: string;
      description?: string;
      durationDays: number;
      price: number;
      features: string[];
      isActive: boolean;
    }>
  ): Promise<ApiResponse<MembershipPlan>> => {
    const response = await apiClient.patch(`/memberships/plans/${planId}`, planData);
    return response.data;
  },

  /**
   * Deactivate a membership plan
   */
  deactivatePlan: async (planId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/memberships/plans/${planId}`);
    return response.data;
  },

  /**
   * Assign membership to a user
   */
  assignMembership: async (
    userId: string,
    membershipData: {
      planId: string;
      startDate?: string;
      autoRenew?: boolean;
      amountPaid?: number;
      paymentReference?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<UserMembership>> => {
    const response = await apiClient.post(`/memberships/users/${userId}`, membershipData);
    return response.data;
  },

  /**
   * Get user's membership history
   */
  getUserMemberships: async (userId: string): Promise<ApiResponse<UserMembership[]>> => {
    const response = await apiClient.get(`/memberships/users/${userId}`);
    return response.data;
  },

  /**
   * Get user's active membership
   */
  getUserActiveMembership: async (userId: string): Promise<ApiResponse<UserMembership>> => {
    const response = await apiClient.get(`/memberships/users/${userId}/active`);
    return response.data;
  },

  /**
   * Get all memberships in organization
   */
  getOrganizationMemberships: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<UserMembership[]>> => {
    const response = await apiClient.get('/memberships', { params });
    return response.data;
  },

  /**
   * Get membership statistics
   */
  getMembershipStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/memberships/stats');
    return response.data;
  },

  /**
   * Get expiring memberships
   */
  getExpiringSoon: async (days?: number): Promise<ApiResponse<UserMembership[]>> => {
    const response = await apiClient.get('/memberships/expiring', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Renew membership
   */
  renewMembership: async (
    membershipId: string,
    renewalData?: {
      planId?: string;
      amountPaid?: number;
      paymentReference?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<UserMembership>> => {
    const response = await apiClient.post(`/memberships/${membershipId}/renew`, renewalData);
    return response.data;
  },

  /**
   * Cancel membership
   */
  cancelMembership: async (
    membershipId: string,
    reason?: string
  ): Promise<ApiResponse<UserMembership>> => {
    const response = await apiClient.post(`/memberships/${membershipId}/cancel`, { reason });
    return response.data;
  },

  /**
   * Suspend membership
   */
  suspendMembership: async (
    membershipId: string,
    suspensionData: {
      reason?: string;
      suspendUntil?: string;
    }
  ): Promise<ApiResponse<UserMembership>> => {
    const response = await apiClient.post(`/memberships/${membershipId}/suspend`, suspensionData);
    return response.data;
  },

  /**
   * Reactivate membership
   */
  reactivateMembership: async (
    membershipId: string,
    notes?: string
  ): Promise<ApiResponse<UserMembership>> => {
    const response = await apiClient.post(`/memberships/${membershipId}/reactivate`, { notes });
    return response.data;
  },
};
