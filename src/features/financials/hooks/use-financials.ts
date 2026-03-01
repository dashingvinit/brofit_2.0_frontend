import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { financialsApi } from '../api/financials-api';
import type {
  CreateExpenseData,
  UpdateExpenseData,
  CreateInvestmentData,
  UpdateInvestmentData,
} from '@/shared/types/common.types';

// ─── Expenses ─────────────────────────────────────────────────────────────────

export function useExpenses(month?: string) {
  return useQuery({
    queryKey: ['financials', 'expenses', month ?? 'all'],
    queryFn: () => financialsApi.getExpenses(month),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseData) => financialsApi.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financials'] });
      toast.success('Expense added');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseData }) =>
      financialsApi.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financials'] });
      toast.success('Expense updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update expense');
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financialsApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financials'] });
      toast.success('Expense deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
    },
  });
}

// ─── Investments ──────────────────────────────────────────────────────────────

export function useInvestments() {
  return useQuery({
    queryKey: ['financials', 'investments'],
    queryFn: () => financialsApi.getInvestments(),
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvestmentData) => financialsApi.createInvestment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financials'] });
      toast.success('Investment added');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add investment');
    },
  });
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvestmentData }) =>
      financialsApi.updateInvestment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financials'] });
      toast.success('Investment updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update investment');
    },
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financialsApi.deleteInvestment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financials'] });
      toast.success('Investment deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete investment');
    },
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export function useMonthlySummary(month?: string) {
  return useQuery({
    queryKey: ['financials', 'summary', month ?? 'current'],
    queryFn: () => financialsApi.getSummary(month),
  });
}

export function useRoi() {
  return useQuery({
    queryKey: ['financials', 'roi'],
    queryFn: () => financialsApi.getRoi(),
  });
}

export function useTrends(months = 12) {
  return useQuery({
    queryKey: ['financials', 'trends', months],
    queryFn: () => financialsApi.getTrends(months),
  });
}
