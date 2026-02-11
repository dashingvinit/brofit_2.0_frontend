import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingPlansApi } from '../api/training-plans-api';
import { toast } from 'sonner';

/**
 * Hook to fetch active training plans with optional category filter
 */
export function useTrainingPlans(category?: string) {
  return useQuery({
    queryKey: ['training-plans', category],
    queryFn: async () => {
      const response = await trainingPlansApi.getActivePlans(category);
      return response.data;
    },
  });
}

/**
 * Hook to fetch all training plans (including inactive) - Admin only
 */
export function useAllTrainingPlans() {
  return useQuery({
    queryKey: ['training-plans', 'all'],
    queryFn: async () => {
      const response = await trainingPlansApi.getAllPlans();
      return response.data;
    },
  });
}

/**
 * Hook to fetch a specific training plan by ID
 */
export function useTrainingPlan(planId: string) {
  return useQuery({
    queryKey: ['training-plans', planId],
    queryFn: async () => {
      const response = await trainingPlansApi.getPlanById(planId);
      return response.data;
    },
    enabled: !!planId,
  });
}

/**
 * Hook to create a new training plan
 */
export function useCreateTrainingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trainingPlansApi.createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      toast.success('Training plan created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create training plan';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a training plan
 */
export function useUpdateTrainingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: any }) =>
      trainingPlansApi.updatePlan(planId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      queryClient.invalidateQueries({ queryKey: ['training-plans', variables.planId] });
      toast.success('Training plan updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update training plan';
      toast.error(message);
    },
  });
}

/**
 * Hook to deactivate a training plan
 */
export function useDeactivateTrainingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trainingPlansApi.deactivatePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      toast.success('Training plan deactivated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to deactivate training plan';
      toast.error(message);
    },
  });
}
