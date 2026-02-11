import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipsApi } from '../api/memberships-api';
import { toast } from 'sonner';

export function useAllMembershipPlans() {
  return useQuery({
    queryKey: ['membership-plans', 'all'],
    queryFn: () => membershipsApi.getAllPlans(),
    select: (response) => response.data,
  });
}

export function useCreateMembershipPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: membershipsApi.createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      toast.success('Membership plan created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create membership plan');
    },
  });
}

export function useUpdateMembershipPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, planData }: { planId: string; planData: any }) =>
      membershipsApi.updatePlan(planId, planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      toast.success('Membership plan updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update membership plan');
    },
  });
}

export function useDeactivateMembershipPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: membershipsApi.deactivatePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      toast.success('Membership plan deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate membership plan');
    },
  });
}
