import { useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipPlansApi } from '../api/membership-plans-api';
import { toast } from 'sonner';

/**
 * Hook to add a membership plan to a user
 */
export function useAddUserMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      membershipPlansApi.addMembershipToUser(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Membership added successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to add membership';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a user's membership plan
 */
export function useUpdateUserMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, membershipId, data }: { userId: string; membershipId: string; data: any }) =>
      membershipPlansApi.updateUserMembership(userId, membershipId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Membership updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update membership';
      toast.error(message);
    },
  });
}

/**
 * Hook to remove a membership plan from a user
 */
export function useRemoveUserMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, membershipId }: { userId: string; membershipId: string }) =>
      membershipPlansApi.removeUserMembership(userId, membershipId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Membership removed successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to remove membership';
      toast.error(message);
    },
  });
}
