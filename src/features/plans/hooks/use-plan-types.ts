import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planTypesApi } from '../api/plan-types-api';
import type {
  PlanType,
  PlanCategory,
  CreatePlanTypeData,
  UpdatePlanTypeData
} from '@/shared/types/common.types';

/**
 * Hook to fetch active plan types
 */
export function usePlanTypes() {
  return useQuery({
    queryKey: ['plan-types'],
    queryFn: async () => {
      const response = await planTypesApi.getActivePlanTypes();
      return response.data;
    },
  });
}

/**
 * Hook to fetch active plan types filtered by category
 */
export function usePlanTypesByCategory(category: PlanCategory) {
  return useQuery({
    queryKey: ['plan-types', 'category', category],
    queryFn: async () => {
      const response = await planTypesApi.getActivePlanTypes(category);
      return response.data;
    },
  });
}

/**
 * Hook to fetch all plan types (including inactive) - Admin only
 */
export function useAllPlanTypes() {
  return useQuery({
    queryKey: ['plan-types', 'all'],
    queryFn: async () => {
      const response = await planTypesApi.getAllPlanTypes();
      return response.data;
    },
  });
}

/**
 * Hook to fetch a specific plan type by ID (with variants)
 */
export function usePlanTypeById(id: string) {
  return useQuery({
    queryKey: ['plan-types', id],
    queryFn: async () => {
      const response = await planTypesApi.getPlanTypeById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new plan type
 */
export function useCreatePlanType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanTypeData) => planTypesApi.createPlanType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-types'] });
      toast.success('Plan type created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create plan type';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a plan type
 */
export function useUpdatePlanType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanTypeData }) =>
      planTypesApi.updatePlanType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plan-types'] });
      queryClient.invalidateQueries({ queryKey: ['plan-types', variables.id] });
      toast.success('Plan type updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update plan type';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a plan type
 */
export function useDeletePlanType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => planTypesApi.deletePlanType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-types'] });
      toast.success('Plan type deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete plan type';
      toast.error(message);
    },
  });
}

/**
 * Hook to deactivate a plan type
 */
export function useDeactivatePlanType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => planTypesApi.deactivatePlanType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-types'] });
      toast.success('Plan type deactivated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to deactivate plan type';
      toast.error(message);
    },
  });
}
