import { apiClient } from '@/shared/lib/api-client';
import type {
  Member,
  CreateMemberData,
  UpdateMemberData,
  MemberStats,
  ApiResponse,
} from '@/shared/types/common.types';

/**
 * Members API
 * Base path: /api/v1/members
 * Simple CRUD operations for members
 */

export interface GetAllMembersResponse extends ApiResponse<Member[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchMembersParams {
  q: string; // Search query
  page?: number;
  limit?: number;
}

export const membersApi = {
  /**
   * Get all members in the organization
   * GET /api/v1/members
   */
  getAllMembers: async (
    page = 1,
    limit = 20,
    isActive?: boolean | null,
    joinedFrom?: string | null,
    joinedTo?: string | null,
    planTypeId?: string | null,
    hasDiscount?: boolean,
    noMembership?: boolean,
  ): Promise<GetAllMembersResponse> => {
    const params: Record<string, unknown> = { page, limit };
    if (isActive === true) params.isActive = 'true';
    else if (isActive === false) params.isActive = 'false';
    if (joinedFrom) params.joinedFrom = joinedFrom;
    if (joinedTo) params.joinedTo = joinedTo;
    if (planTypeId) params.planTypeId = planTypeId;
    if (hasDiscount) params.hasDiscount = 'true';
    if (noMembership) params.noMembership = 'true';
    const response = await apiClient.get('/members', { params });
    return response.data;
  },

  /**
   * Search members by name, email, or phone
   * GET /api/v1/members/search
   */
  searchMembers: async (
    params: SearchMembersParams
  ): Promise<GetAllMembersResponse> => {
    const response = await apiClient.get('/members/search', {
      params,
    });
    return response.data;
  },

  /**
   * Get member statistics
   * GET /api/v1/members/stats
   */
  getMemberStats: async (): Promise<ApiResponse<MemberStats>> => {
    const response = await apiClient.get('/members/stats');
    return response.data;
  },

  /**
   * Get member by ID
   * GET /api/v1/members/:id
   */
  getMemberById: async (memberId: string): Promise<ApiResponse<Member>> => {
    const response = await apiClient.get(`/members/${memberId}`);
    return response.data;
  },

  /**
   * Create new member
   * POST /api/v1/members
   */
  createMember: async (
    data: CreateMemberData
  ): Promise<ApiResponse<Member>> => {
    const response = await apiClient.post('/members', data);
    return response.data;
  },

  /**
   * Update member
   * PATCH /api/v1/members/:id
   */
  updateMember: async (
    memberId: string,
    data: UpdateMemberData
  ): Promise<ApiResponse<Member>> => {
    const response = await apiClient.patch(`/members/${memberId}`, data);
    return response.data;
  },

  /**
   * Delete member (soft delete)
   * DELETE /api/v1/members/:id
   */
  deleteMember: async (memberId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/members/${memberId}`);
    return response.data;
  },

  /**
   * Batch update members (e.g. bulk deactivate/reactivate)
   * PATCH /api/v1/members/batch
   */
  batchUpdateMembers: async (
    ids: string[],
    data: UpdateMemberData,
  ): Promise<{ success: boolean; message: string; data: { succeeded: number; failed: number; total: number } }> => {
    const response = await apiClient.patch('/members/batch', { ids, ...data });
    return response.data;
  },

  /**
   * Batch delete members
   * DELETE /api/v1/members/batch
   */
  batchDeleteMembers: async (
    ids: string[],
  ): Promise<{ success: boolean; message: string; data: { succeeded: number; failed: number; total: number } }> => {
    const response = await apiClient.delete('/members/batch', { data: { ids } });
    return response.data;
  },

  /**
   * Bulk import members from CSV rows
   * POST /api/v1/members/import
   */
  importMembers: async (
    rows: Record<string, string>[],
  ): Promise<{ success: boolean; imported: number; errors: string[] }> => {
    const response = await apiClient.post('/members/import', { rows });
    return response.data;
  },

  /**
   * Merge two members
   * POST /api/v1/members/merge
   */
  mergeMembers: async (
    sourceId: string,
    targetId: string,
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/members/merge', { sourceId, targetId });
    return response.data;
  },
};
