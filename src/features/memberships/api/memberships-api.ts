import { apiClient } from '@/shared/lib/api-client';
import type {
  Membership,
  CreateMembershipData,
  MembershipStats,
  MembershipDues,
  Payment,
  RecordPaymentData,
  ApiResponse,
} from '@/shared/types/common.types';

/**
 * Memberships API
 * Base path: /api/v1/memberships
 */

export interface GetAllMembershipsResponse extends ApiResponse<Membership[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const membershipsApi = {
  /**
   * Get all memberships in the organization
   * GET /api/v1/memberships
   */
  getAllMemberships: async (
    page = 1,
    limit = 100
  ): Promise<GetAllMembershipsResponse> => {
    const response = await apiClient.get('/memberships', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get membership by ID
   * GET /api/v1/memberships/:id
   */
  getMembershipById: async (id: string): Promise<ApiResponse<Membership>> => {
    const response = await apiClient.get(`/memberships/${id}`);
    return response.data;
  },

  /**
   * Get memberships for a specific member
   * GET /api/v1/memberships/member/:memberId
   */
  getMemberMemberships: async (
    memberId: string
  ): Promise<ApiResponse<Membership[]>> => {
    const response = await apiClient.get(`/memberships/member/${memberId}`);
    return response.data;
  },

  /**
   * Get active membership for a member
   * GET /api/v1/memberships/member/:memberId/active
   */
  getActiveMembership: async (
    memberId: string
  ): Promise<ApiResponse<Membership | null>> => {
    const response = await apiClient.get(
      `/memberships/member/${memberId}/active`
    );
    return response.data;
  },

  /**
   * Get membership statistics
   * GET /api/v1/memberships/stats
   */
  getMembershipStats: async (): Promise<ApiResponse<MembershipStats>> => {
    const response = await apiClient.get('/memberships/stats');
    return response.data;
  },

  /**
   * Create a new membership
   * POST /api/v1/memberships
   */
  createMembership: async (
    data: CreateMembershipData
  ): Promise<ApiResponse<Membership>> => {
    const response = await apiClient.post('/memberships', data);
    return response.data;
  },

  /**
   * Update membership (notes, autoRenew, endDate)
   * PATCH /api/v1/memberships/:id
   */
  updateMembership: async (
    id: string,
    data: { notes?: string; autoRenew?: boolean; startDate?: string; endDate?: string; discountAmount?: number }
  ): Promise<ApiResponse<Membership>> => {
    const response = await apiClient.patch(`/memberships/${id}`, data);
    return response.data;
  },

  /**
   * Cancel a membership
   * PUT /api/v1/memberships/:id/cancel
   */
  cancelMembership: async (id: string): Promise<ApiResponse<Membership>> => {
    const response = await apiClient.put(`/memberships/${id}/cancel`);
    return response.data;
  },

  /**
   * Freeze a membership
   * PUT /api/v1/memberships/:id/freeze
   */
  freezeMembership: async (id: string): Promise<ApiResponse<Membership>> => {
    const response = await apiClient.put(`/memberships/${id}/freeze`);
    return response.data;
  },

  /**
   * Unfreeze a membership
   * PUT /api/v1/memberships/:id/unfreeze
   */
  unfreezeMembership: async (id: string): Promise<ApiResponse<Membership>> => {
    const response = await apiClient.put(`/memberships/${id}/unfreeze`);
    return response.data;
  },

  /**
   * Get membership dues (payment tracking)
   * GET /api/v1/memberships/:id/dues
   */
  getMembershipDues: async (
    membershipId: string
  ): Promise<ApiResponse<MembershipDues>> => {
    const response = await apiClient.get(`/memberships/${membershipId}/dues`);
    return response.data;
  },

  /**
   * Record a payment against a membership
   * POST /api/v1/memberships/payments
   */
  recordPayment: async (
    data: RecordPaymentData
  ): Promise<ApiResponse<Payment>> => {
    const response = await apiClient.post('/memberships/payments', data);
    return response.data;
  },

  /**
   * Get expiring memberships
   * GET /api/v1/memberships/expiring
   */
  getExpiringMemberships: async (
    days = 7
  ): Promise<ApiResponse<Membership[]>> => {
    const response = await apiClient.get('/memberships/expiring', {
      params: { days },
    });
    return response.data;
  },
};
