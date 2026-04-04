import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { useRole } from '@/shared/hooks/use-role';
import {
  staffPermissionsApi,
  type StaffPermissions,
  type PermissionFlags,
} from '../api/staff-permissions-api';

// Must match repo.DEFAULTS in staff-permissions.repository.js
const DEFAULTS: PermissionFlags = {
  canTakeAttendance: true,
  canRegisterMember: false,
  canCreateMembership: false,
  canCreateTraining: false,
  canRecordPayment: false,
  canViewMembers: true,
  canViewReports: false,
};

export const STAFF_PERMISSIONS_QUERY_KEY = ['staff-permissions'];
export const ORG_STAFF_LIST_QUERY_KEY = ['staff-permissions', 'members'];

/**
 * Returns org-level default permissions + resolvedPermissions for the current user.
 *
 * resolvedPermissions fallback chain:
 *   1. per-user Clerk publicMetadata.staffPermissions  (staff only, zero API calls)
 *   2. org-level OrgStaffPermissions DB record
 *   3. hardcoded DEFAULTS
 *
 * Admins always get DEFAULTS as resolvedPermissions (they bypass permission checks entirely).
 */
export function useStaffPermissions() {
  const { isAdmin, isStaff } = useRole();
  const { user } = useUser();

  // Per-user override lives in Clerk publicMetadata — already in session, no network call
  const perUserPerms = user?.publicMetadata?.staffPermissions as PermissionFlags | undefined;

  const query = useQuery({
    queryKey: STAFF_PERMISSIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await staffPermissionsApi.get();
      return res.data;
    },
    // Fetch org defaults when:
    //   - admin (needs them for the org defaults UI section)
    //   - staff with no per-user override yet (needs the fallback)
    enabled: isAdmin || (isStaff && perUserPerms === undefined),
  });

  const resolvedPermissions: PermissionFlags =
    perUserPerms ?? (query.data ? { ...DEFAULTS, ...query.data } : DEFAULTS);

  return { ...query, resolvedPermissions };
}

export function useUpdateStaffPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Omit<StaffPermissions, 'orgId'>>) =>
      staffPermissionsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_PERMISSIONS_QUERY_KEY });
    },
  });
}

/** Admin: list all org:staff members with their per-user permission overrides */
export function useOrgStaffList() {
  return useQuery({
    queryKey: ORG_STAFF_LIST_QUERY_KEY,
    queryFn: async () => {
      const res = await staffPermissionsApi.getStaffMembers();
      return res.data;
    },
  });
}

/** Admin: save per-user permission overrides to Clerk publicMetadata */
export function useUpdateStaffMemberPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clerkUserId, data }: { clerkUserId: string; data: PermissionFlags }) =>
      staffPermissionsApi.updateStaffMember(clerkUserId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_STAFF_LIST_QUERY_KEY });
    },
  });
}
