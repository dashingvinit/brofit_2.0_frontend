import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { membersApi, type SearchMembersParams } from '../api/members-api';
import type { CreateMemberData, UpdateMemberData } from '@/shared/types/common.types';

/**
 * Hook to fetch all members with pagination
 */
export function useMembers(page = 1, limit = 100) {
  return useQuery({
    queryKey: ['members', page, limit],
    queryFn: () => membersApi.getAllMembers(page, limit),
  });
}

/**
 * Hook to search members
 */
export function useSearchMembers(params: SearchMembersParams) {
  return useQuery({
    queryKey: ['members', 'search', params],
    queryFn: () => membersApi.searchMembers(params),
    enabled: !!params.q, // Only run if search query exists
  });
}

/**
 * Hook to fetch member statistics
 */
export function useMemberStats() {
  return useQuery({
    queryKey: ['members', 'stats'],
    queryFn: () => membersApi.getMemberStats(),
  });
}

/**
 * Hook to fetch a single member by ID
 */
export function useMember(memberId: string) {
  return useQuery({
    queryKey: ['members', memberId],
    queryFn: () => membersApi.getMemberById(memberId),
    enabled: !!memberId,
  });
}

/**
 * Hook to create a new member
 */
export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMemberData) => membersApi.createMember(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success(response.message || 'Member created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create member');
    },
  });
}

/**
 * Hook to update a member
 */
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: UpdateMemberData }) =>
      membersApi.updateMember(memberId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', variables.memberId] });
      toast.success(response.message || 'Member updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update member');
    },
  });
}

/**
 * Hook to delete a member (soft delete)
 */
export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => membersApi.deleteMember(memberId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success(response.message || 'Member deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete member');
    },
  });
}
