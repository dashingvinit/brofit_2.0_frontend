import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { membersApi, type SearchMembersParams } from "../api/members-api";
import { reportsApi } from "../api/reports-api";
import type {
  CreateMemberData,
  UpdateMemberData,
  Member,
} from "@/shared/types/common.types";

/**
 * Hook to fetch all members with pagination
 */
export function useMembers(
  page = 1,
  limit = 20,
  isActive?: boolean | null,
  joinedFrom?: string | null,
  joinedTo?: string | null,
  planTypeId?: string | null,
  hasDiscount?: boolean,
  noMembership?: boolean,
) {
  return useQuery({
    queryKey: [
      "members",
      page,
      limit,
      isActive,
      joinedFrom,
      joinedTo,
      planTypeId,
      hasDiscount ?? false,
      noMembership ?? false,
    ],
    queryFn: () =>
      membersApi.getAllMembers(
        page,
        limit,
        isActive,
        joinedFrom,
        joinedTo,
        planTypeId,
        hasDiscount,
        noMembership,
      ),
  });
}

/**
 * Hook to search members
 */
export function useSearchMembers(params: SearchMembersParams) {
  return useQuery({
    queryKey: ["members", "search", params],
    queryFn: () => membersApi.searchMembers(params),
    enabled: !!params.q, // Only run if search query exists
  });
}

/**
 * Hook to fetch member statistics
 */
export function useMemberStats() {
  return useQuery({
    queryKey: ["members", "stats"],
    queryFn: () => membersApi.getMemberStats(),
  });
}

/**
 * Hook to fetch a single member by ID
 */
export function useMember(memberId: string) {
  return useQuery({
    queryKey: ["members", memberId],
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
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success(response.message || "Member created successfully");
    },
    onError: (error: any) => {
      if (error.response?.status === 409) return; // duplicate dialog handles this
      toast.error(error.response?.data?.message || "Failed to create member");
    },
  });
}

/**
 * Hook to update a member
 */
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: string;
      data: UpdateMemberData;
    }) => membersApi.updateMember(memberId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({
        queryKey: ["members", variables.memberId],
      });
      toast.success(response.message || "Member updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update member");
    },
  });
}

/**
 * Hook to batch update members (e.g. bulk deactivate/reactivate)
 */
export function useBatchUpdateMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: UpdateMemberData }) =>
      membersApi.batchUpdateMembers(ids, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success(response.message || "Members updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update members");
    },
  });
}

/**
 * Hook to batch delete members
 */
export function useBatchDeleteMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => membersApi.batchDeleteMembers(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success(response.message || "Members deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete members");
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => membersApi.deleteMember(memberId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success(response.message || "Member permanently deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete member");
    },
  });
}

/**
 * Hook to archive a member (move to recycle bin)
 */
export function useArchiveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      membersApi.updateMember(memberId, { isActive: false }),
    onSuccess: (response, memberId) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["members", memberId] });
      queryClient.invalidateQueries({ queryKey: ["members", "stats"] });
      toast.success(response.message || "Member moved to recycle bin");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to archive member");
    },
  });
}

/**
 * Hook to restore a member from recycle bin
 */
export function useRestoreMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      membersApi.updateMember(memberId, { isActive: true }),
    onSuccess: (response, memberId) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["members", memberId] });
      queryClient.invalidateQueries({ queryKey: ["members", "stats"] });
      toast.success(response.message || "Member restored from recycle bin");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to restore member");
    },
  });
}

/**
 * Hook to merge two members
 */
export function useMergeMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sourceId,
      targetId,
    }: {
      sourceId: string;
      targetId: string;
    }) => membersApi.mergeMembers(sourceId, targetId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success(response.message || "Members merged successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to merge members");
    },
  });
}

/**
 * Hook to fetch potential duplicate members
 */
export function useDuplicates() {
  return useQuery({
    queryKey: ["members", "duplicates"],
    queryFn: () => reportsApi.getDuplicates(),
  });
}
