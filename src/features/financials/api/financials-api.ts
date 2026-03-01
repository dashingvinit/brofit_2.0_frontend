import { apiClient } from '@/shared/lib/api-client';
import type {
  Expense,
  Investment,
  MonthlySummary,
  RoiMetrics,
  TrendPoint,
  CreateExpenseData,
  UpdateExpenseData,
  CreateInvestmentData,
  UpdateInvestmentData,
  ApiResponse,
} from '@/shared/types/common.types';

/**
 * Financials API
 * Base path: /api/v1/financials
 */

export const financialsApi = {
  // ─── Expenses ─────────────────────────────────────────────────────────────

  getExpenses: async (month?: string): Promise<ApiResponse<Expense[]>> => {
    const response = await apiClient.get('/financials/expenses', {
      params: month ? { month } : undefined,
    });
    return response.data;
  },

  createExpense: async (data: CreateExpenseData): Promise<ApiResponse<Expense>> => {
    const response = await apiClient.post('/financials/expenses', data);
    return response.data;
  },

  updateExpense: async (id: string, data: UpdateExpenseData): Promise<ApiResponse<Expense>> => {
    const response = await apiClient.patch(`/financials/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/financials/expenses/${id}`);
    return response.data;
  },

  // ─── Investments ───────────────────────────────────────────────────────────

  getInvestments: async (): Promise<ApiResponse<Investment[]>> => {
    const response = await apiClient.get('/financials/investments');
    return response.data;
  },

  createInvestment: async (data: CreateInvestmentData): Promise<ApiResponse<Investment>> => {
    const response = await apiClient.post('/financials/investments', data);
    return response.data;
  },

  updateInvestment: async (id: string, data: UpdateInvestmentData): Promise<ApiResponse<Investment>> => {
    const response = await apiClient.patch(`/financials/investments/${id}`, data);
    return response.data;
  },

  deleteInvestment: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/financials/investments/${id}`);
    return response.data;
  },

  // ─── Analytics ────────────────────────────────────────────────────────────

  getSummary: async (month?: string): Promise<ApiResponse<MonthlySummary>> => {
    const response = await apiClient.get('/financials/summary', {
      params: month ? { month } : undefined,
    });
    return response.data;
  },

  getRoi: async (): Promise<ApiResponse<RoiMetrics>> => {
    const response = await apiClient.get('/financials/roi');
    return response.data;
  },

  getTrends: async (months = 12): Promise<ApiResponse<TrendPoint[]>> => {
    const response = await apiClient.get('/financials/trends', {
      params: { months },
    });
    return response.data;
  },
};
