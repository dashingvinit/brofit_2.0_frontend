import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { membershipsApi } from '../api/memberships-api';
import type { CreateMembershipData, RecordPaymentData } from '@/shared/types/common.types';

/**
 * Hook to fetch all memberships with pagination
 */
export function useMemberships(page = 1, limit = 100) {
  return useQuery({
    queryKey: ['memberships', page, limit],
    queryFn: () => membershipsApi.getAllMemberships(page, limit),
  });
}

/**
 * Hook to fetch a single membership by ID
 */
export function useMembership(id: string) {
  return useQuery({
    queryKey: ['memberships', id],
    queryFn: () => membershipsApi.getMembershipById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch memberships for a specific member
 */
export function useMemberMemberships(memberId: string) {
  return useQuery({
    queryKey: ['memberships', 'member', memberId],
    queryFn: () => membershipsApi.getMemberMemberships(memberId),
    enabled: !!memberId,
  });
}

/**
 * Hook to fetch active membership for a member
 */
export function useActiveMembership(memberId: string) {
  return useQuery({
    queryKey: ['memberships', 'member', memberId, 'active'],
    queryFn: () => membershipsApi.getActiveMembership(memberId),
    enabled: !!memberId,
  });
}

/**
 * Hook to fetch membership statistics
 */
export function useMembershipStats() {
  return useQuery({
    queryKey: ['memberships', 'stats'],
    queryFn: () => membershipsApi.getMembershipStats(),
  });
}

/**
 * Hook to create a new membership
 */
export function useCreateMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMembershipData) =>
      membershipsApi.createMembership(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success(response.message || 'Membership created successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create membership'
      );
    },
  });
}

/**
 * Hook to update a membership (notes, autoRenew, endDate)
 */
export function useUpdateMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { notes?: string; autoRenew?: boolean; endDate?: string };
    }) => membershipsApi.updateMembership(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['memberships', variables.id] });
      toast.success(response.message || 'Membership updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to update membership'
      );
    },
  });
}

/**
 * Hook to cancel a membership
 */
export function useCancelMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => membershipsApi.cancelMembership(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['memberships', id] });
      toast.success(response.message || 'Membership cancelled');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to cancel membership'
      );
    },
  });
}

/**
 * Hook to freeze a membership
 */
export function useFreezeMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => membershipsApi.freezeMembership(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['memberships', id] });
      toast.success(response.message || 'Membership frozen');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to freeze membership'
      );
    },
  });
}

/**
 * Hook to unfreeze a membership
 */
export function useUnfreezeMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => membershipsApi.unfreezeMembership(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['memberships', id] });
      toast.success(response.message || 'Membership unfrozen');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to unfreeze membership'
      );
    },
  });
}

/**
 * Hook to fetch membership dues (payment tracking)
 */
export function useMembershipDues(membershipId: string) {
  return useQuery({
    queryKey: ['memberships', membershipId, 'dues'],
    queryFn: () => membershipsApi.getMembershipDues(membershipId),
    enabled: !!membershipId,
  });
}

/**
 * Hook to record a payment against a membership
 */
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordPaymentData) => membershipsApi.recordPayment(data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      if (variables.membershipId) {
        queryClient.invalidateQueries({
          queryKey: ['memberships', variables.membershipId, 'dues'],
        });
      }
      toast.success(response.message || 'Payment recorded successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to record payment'
      );
    },
  });
}

/**
 * Hook to fetch expiring memberships
 */
export function useExpiringMemberships(days = 7) {
  return useQuery({
    queryKey: ['memberships', 'expiring', days],
    queryFn: () => membershipsApi.getExpiringMemberships(days),
  });
}
