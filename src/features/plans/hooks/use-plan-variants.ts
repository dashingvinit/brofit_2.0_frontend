import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planVariantsApi } from '../api/plan-variants-api';
import type {
  PlanVariant,
  CreatePlanVariantData,
  UpdatePlanVariantData
} from '@/shared/types/common.types';

/**
 * Hook to fetch variants for a specific plan type
 */
export function usePlanVariantsByType(planTypeId: string, includeInactive = true) {
  return useQuery({
    queryKey: ['plan-variants', 'by-type', planTypeId, includeInactive],
    queryFn: async () => {
      const response = await planVariantsApi.getVariantsByPlanType(planTypeId, includeInactive);
      return response.data;
    },
    enabled: !!planTypeId,
  });
}

/**
 * Hook to fetch a specific variant by ID
 */
export function usePlanVariantById(id: string) {
  return useQuery({
    queryKey: ['plan-variants', id],
    queryFn: async () => {
      const response = await planVariantsApi.getVariantById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new variant for a plan type
 */
export function useCreatePlanVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planTypeId, data }: { planTypeId: string; data: CreatePlanVariantData }) =>
      planVariantsApi.createVariant(planTypeId, data),
    onSuccess: (_, variables) => {
      // Invalidate the variants list for this plan type
      queryClient.invalidateQueries({ queryKey: ['plan-variants', 'by-type', variables.planTypeId] });
      // Also invalidate the plan type to refresh its variants
      queryClient.invalidateQueries({ queryKey: ['plan-types', variables.planTypeId] });
      toast.success('Plan variant created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create plan variant';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a variant
 */
export function useUpdatePlanVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanVariantData }) =>
      planVariantsApi.updateVariant(id, data),
    onSuccess: (response, variables) => {
      // Invalidate all variants queries
      queryClient.invalidateQueries({ queryKey: ['plan-variants'] });
      // Also invalidate the plan type if we have the planTypeId
      if (response.data.planTypeId) {
        queryClient.invalidateQueries({ queryKey: ['plan-types', response.data.planTypeId] });
      }
      toast.success('Plan variant updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update plan variant';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a variant
 */
export function useDeletePlanVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => planVariantsApi.deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-variants'] });
      queryClient.invalidateQueries({ queryKey: ['plan-types'] });
      toast.success('Plan variant deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete plan variant';
      toast.error(message);
    },
  });
}

/**
 * Hook to deactivate a variant
 */
export function useDeactivatePlanVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => planVariantsApi.deactivateVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-variants'] });
      queryClient.invalidateQueries({ queryKey: ['plan-types'] });
      toast.success('Plan variant deactivated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to deactivate plan variant';
      toast.error(message);
    },
  });
}
