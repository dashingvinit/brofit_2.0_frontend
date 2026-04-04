import { apiClient } from '@/shared/lib/api-client';
import type {
  Membership,
  CreateMembershipData,
  MembershipStats,
  MembershipDues,
  Payment,
  RecordPaymentData,
  ApiResponse,
  PaginationInfo,
} from '@/shared/types/common.types';

/**
 * Memberships API
 * Base path: /api/v1/memberships
 */

export interface GetAllMembershipsResponse extends ApiResponse<Membership[]> {
  pagination?: PaginationInfo;
}

export const membershipsApi = {
  /**
   * Get all memberships in the organization
   * GET /api/v1/memberships
   */
  getAllMemberships: async (
    page = 1,
    limit = 100,
    status?: string | null,
    createdFrom?: string | null,
    createdTo?: string | null,
  ): Promise<GetAllMembershipsResponse> => {
    const params: Record<string, unknown> = { page, limit };
    if (status) params.status = status;
    if (createdFrom) params.createdFrom = createdFrom;
    if (createdTo) params.createdTo = createdTo;
    const response = await apiClient.get('/memberships', { params });
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
   * Delete a membership (only if no payments recorded)
   * DELETE /api/v1/memberships/:id
   */
  deleteMembership: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/memberships/${id}`);
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
  freezeMembership: async (
    id: string,
    data?: { reason?: string; freezeStartDate?: string; freezeEndDate?: string }
  ): Promise<ApiResponse<Membership>> => {
    const response = await apiClient.put(`/memberships/${id}/freeze`, data);
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
   * Delete a payment
   * DELETE /api/v1/memberships/payments/:id
   */
  deletePayment: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/memberships/payments/${id}`);
    return response.data;
  },

  /**
   * Batch cancel memberships
   * PUT /api/v1/memberships/batch/cancel
   */
  batchCancelMemberships: async (ids: string[]): Promise<ApiResponse<{ succeeded: number; failed: number; total: number }>> => {
    const response = await apiClient.put('/memberships/batch/cancel', { ids });
    return response.data;
  },

  /**
   * Batch freeze memberships
   * PUT /api/v1/memberships/batch/freeze
   */
  batchFreezeMemberships: async (
    ids: string[],
    data?: { reason?: string; freezeStartDate?: string; freezeEndDate?: string }
  ): Promise<ApiResponse<{ succeeded: number; failed: number; total: number }>> => {
    const response = await apiClient.put('/memberships/batch/freeze', { ids, ...data });
    return response.data;
  },

  /**
   * Batch unfreeze memberships
   * PUT /api/v1/memberships/batch/unfreeze
   */
  batchUnfreezeMemberships: async (ids: string[]): Promise<ApiResponse<{ succeeded: number; failed: number; total: number }>> => {
    const response = await apiClient.put('/memberships/batch/unfreeze', { ids });
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
