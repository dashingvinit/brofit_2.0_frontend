import { apiClient } from '@/shared/lib/api-client';
import type {
  ApiResponse,
  TopPlanItem,
  RetentionMetrics,
  RevenueBreakdownPoint,
  PaymentMethodItem,
  TrainerPerformanceItem,
  MemberGrowthPoint,
  DemographicsData,
  MembershipDurationPreference,
  UnitEconomics,
  ProjectionData,
} from '@/shared/types/common.types';

export interface DiscountBreakdown {
  window: number;
  totalOfferDriven: number;
  totalFlat: number;
  total: number;
  discountedCount: number;
  totalSales: number;
  discountRate: number;
  byMonth: Array<{
    year: number;
    month: number;
    offer: number;
    flat: number;
    total: number;
  }>;
}

export const analyticsApi = {
  getTopPlans: async (months = 6): Promise<ApiResponse<TopPlanItem[]>> => {
    const response = await apiClient.get('/analytics/top-plans', { params: { months } });
    return response.data;
  },

  getRetention: async (): Promise<ApiResponse<RetentionMetrics>> => {
    const response = await apiClient.get('/analytics/retention');
    return response.data;
  },

  getRevenueBreakdown: async (months = 6): Promise<ApiResponse<RevenueBreakdownPoint[]>> => {
    const response = await apiClient.get('/analytics/revenue-breakdown', { params: { months } });
    return response.data;
  },

  getPaymentMethods: async (): Promise<ApiResponse<PaymentMethodItem[]>> => {
    const response = await apiClient.get('/analytics/payment-methods');
    return response.data;
  },

  getTrainerPerformance: async (): Promise<ApiResponse<TrainerPerformanceItem[]>> => {
    const response = await apiClient.get('/analytics/trainer-performance');
    return response.data;
  },

  getMemberGrowth: async (months = 12): Promise<ApiResponse<MemberGrowthPoint[]>> => {
    const response = await apiClient.get('/analytics/member-growth', { params: { months } });
    return response.data;
  },

  getDemographics: async (): Promise<ApiResponse<DemographicsData>> => {
    const response = await apiClient.get('/analytics/demographics');
    return response.data;
  },

  getMembershipDurationPreference: async (): Promise<ApiResponse<MembershipDurationPreference>> => {
    const response = await apiClient.get('/analytics/membership-duration-preference');
    return response.data;
  },

  getUnitEconomics: async (window = 3): Promise<ApiResponse<UnitEconomics>> => {
    const response = await apiClient.get('/analytics/unit-economics', { params: { window } });
    return response.data;
  },

  getProjection: async (window = 3, horizon = 12, fixedCost?: number): Promise<ApiResponse<ProjectionData>> => {
    const params: Record<string, number> = { window, horizon };
    if (fixedCost !== undefined) params.fixedCost = fixedCost;
    const response = await apiClient.get('/analytics/projection', { params });
    return response.data;
  },

  getDiscounts: async (months = 6): Promise<ApiResponse<DiscountBreakdown>> => {
    const response = await apiClient.get('/analytics/discounts', { params: { months } });
    return response.data;
  },
};
