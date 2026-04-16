import { apiClient } from '@/shared/lib/api-client';

/**
 * Reports API — dues endpoint
 * Base path: /api/v1/reports
 */

export interface MemberDuesBreakdown {
  id: string;
  planName: string;
  variantName: string;
  finalPrice: number;
  totalPaid: number;
  dueAmount: number;
  status: string;
  endDate: string;
}

export interface MemberDuesItem {
  memberId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  isActive: boolean;
  totalDue: number;
  membershipDuesTotal: number;
  trainingDuesTotal: number;
  membershipDues: MemberDuesBreakdown[];
  trainingDues: MemberDuesBreakdown[];
}

export interface DuesReportResponse {
  success: boolean;
  data: MemberDuesItem[];
  summary: {
    totalMembersWithDues: number;
    grandTotal: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface InactiveCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joinDate: string;
  lastSubscriptionEnd: string | null;
  latestMembership: { id: string; status: string; endDate: string } | null;
  latestTraining: { id: string; status: string; endDate: string } | null;
}

export const reportsApi = {
  /**
   * Get active members with no active memberships or trainings
   * GET /api/v1/reports/inactive-candidates
   */
  getInactiveCandidates: async (
    page = 1,
    limit = 10
  ): Promise<{ success: boolean; data: InactiveCandidate[]; pagination: { page: number; limit: number; total: number; pages: number; hasNext: boolean; hasPrev: boolean } }> => {
    const response = await apiClient.get('/reports/inactive-candidates', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Manually trigger expiration sync for the current org
   * POST /api/v1/reports/sync-expirations
   */
  syncExpirations: async (): Promise<{
    success: boolean;
    data: {
      expiredMemberships: number;
      expiredTrainings: number;
      renewedMemberships: number;
      renewedTrainings: number;
    };
  }> => {
    const response = await apiClient.post('/reports/sync-expirations');
    return response.data;
  },

  /**
   * Get dues report for a specific member
   * GET /api/v1/reports/dues?memberId=<id>
   */
  getMemberDues: async (memberId: string): Promise<DuesReportResponse> => {
    const response = await apiClient.get('/reports/dues', {
      params: { memberId, page: 1, limit: 1 },
    });
    return response.data;
  },

  /**
   * Get all members with outstanding dues
   * GET /api/v1/reports/dues?page=1&limit=10
   */
  getAllDues: async (
    page = 1,
    limit = 10
  ): Promise<DuesReportResponse> => {
    const response = await apiClient.get('/reports/dues', {
      params: { page, limit },
    });
    return response.data;
  },
};
