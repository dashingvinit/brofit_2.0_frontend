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
} from '@/shared/types/common.types';

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
};
