import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApiResponse } from '@/shared/types/common.types';

/**
 * Generic factory function to create plan management hooks
 * Reduces duplication between membership and training plan hooks
 */
export function createPlanHooks<TPlan, TCreateData, TUpdateData>(config: {
  queryKey: string;
  planName: string;
  api: {
    getActivePlans: (...args: any[]) => Promise<ApiResponse<TPlan[]>>;
    getAllPlans: () => Promise<ApiResponse<TPlan[]>>;
    getPlanById: (planId: string) => Promise<ApiResponse<TPlan>>;
    createPlan: (data: TCreateData) => Promise<ApiResponse<TPlan>>;
    updatePlan: (planId: string, data: TUpdateData) => Promise<ApiResponse<TPlan>>;
    deactivatePlan: (planId: string) => Promise<ApiResponse<TPlan>>;
  };
}) {
  const { queryKey, planName, api } = config;

  return {
    /**
     * Hook to fetch active plans
     */
    useActivePlans: (...args: any[]) => {
      return useQuery({
        queryKey: args.length > 0 ? [queryKey, ...args] : [queryKey],
        queryFn: async () => {
          const response = await api.getActivePlans(...args);
          return response.data;
        },
      });
    },

    /**
     * Hook to fetch all plans (including inactive) - Admin only
     */
    useAllPlans: () => {
      return useQuery({
        queryKey: [queryKey, 'all'],
        queryFn: async () => {
          const response = await api.getAllPlans();
          return response.data;
        },
      });
    },

    /**
     * Hook to fetch a specific plan by ID
     */
    usePlanById: (planId: string) => {
      return useQuery({
        queryKey: [queryKey, planId],
        queryFn: async () => {
          const response = await api.getPlanById(planId);
          return response.data;
        },
        enabled: !!planId,
      });
    },

    /**
     * Hook to create a new plan
     */
    useCreatePlan: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: api.createPlan,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
          toast.success(`${planName} created successfully`);
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || `Failed to create ${planName.toLowerCase()}`;
          toast.error(message);
        },
      });
    },

    /**
     * Hook to update a plan
     */
    useUpdatePlan: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: ({ planId, data }: { planId: string; data: TUpdateData }) =>
          api.updatePlan(planId, data),
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
          queryClient.invalidateQueries({ queryKey: [queryKey, variables.planId] });
          toast.success(`${planName} updated successfully`);
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || `Failed to update ${planName.toLowerCase()}`;
          toast.error(message);
        },
      });
    },

    /**
     * Hook to deactivate a plan
     */
    useDeactivatePlan: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: api.deactivatePlan,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
          toast.success(`${planName} deactivated successfully`);
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || `Failed to deactivate ${planName.toLowerCase()}`;
          toast.error(message);
        },
      });
    },
  };
}
