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

export const reportsApi = {
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
