import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipPlansApi } from '../api/membership-plans-api';
import { toast } from 'sonner';

/**
 * Hook to fetch active membership plans
 */
export function useMembershipPlans() {
  return useQuery({
    queryKey: ['membership-plans'],
    queryFn: async () => {
      const response = await membershipPlansApi.getActivePlans();
      return response.data;
    },
  });
}

/**
 * Hook to fetch all membership plans (including inactive) - Admin only
 */
export function useAllMembershipPlans() {
  return useQuery({
    queryKey: ['membership-plans', 'all'],
    queryFn: async () => {
      const response = await membershipPlansApi.getAllPlans();
      return response.data;
    },
  });
}

/**
 * Hook to fetch a specific membership plan by ID
 */
export function useMembershipPlan(planId: string) {
  return useQuery({
    queryKey: ['membership-plans', planId],
    queryFn: async () => {
      const response = await membershipPlansApi.getPlanById(planId);
      return response.data;
    },
    enabled: !!planId,
  });
}

/**
 * Hook to create a new membership plan
 */
export function useCreateMembershipPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: membershipPlansApi.createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      toast.success('Membership plan created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create membership plan';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a membership plan
 */
export function useUpdateMembershipPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: any }) =>
      membershipPlansApi.updatePlan(planId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      queryClient.invalidateQueries({ queryKey: ['membership-plans', variables.planId] });
      toast.success('Membership plan updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update membership plan';
      toast.error(message);
    },
  });
}

/**
 * Hook to deactivate a membership plan
 */
export function useDeactivateMembershipPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: membershipPlansApi.deactivatePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      toast.success('Membership plan deactivated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to deactivate membership plan';
      toast.error(message);
    },
  });
}
