import { apiClient } from '@/shared/lib/api-client';

export type StaffPermissions = {
  orgId: string;
  canTakeAttendance: boolean;
  canRegisterMember: boolean;
  canCreateMembership: boolean;
  canCreateTraining: boolean;
  canRecordPayment: boolean;
  canViewMembers: boolean;
  canViewReports: boolean;
};

// Permission flags without the orgId — used for per-user overrides and resolved permissions
export type PermissionFlags = Omit<StaffPermissions, 'orgId'>;

export type StaffMemberWithPermissions = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  identifier: string;
  imageUrl: string;
  role: string;
  staffPermissions: PermissionFlags | null; // null = no per-user override, falls back to org defaults
};

type ApiResponse<T> = { success: boolean; data: T };

export const staffPermissionsApi = {
  // Org-level defaults
  get: async (): Promise<ApiResponse<StaffPermissions>> => {
    const response = await apiClient.get('/staff-permissions');
    return response.data;
  },

  update: async (
    data: Partial<PermissionFlags>
  ): Promise<ApiResponse<StaffPermissions>> => {
    const response = await apiClient.patch('/staff-permissions', data);
    return response.data;
  },

  // Per-staff member
  getStaffMembers: async (): Promise<ApiResponse<StaffMemberWithPermissions[]>> => {
    const response = await apiClient.get('/staff-permissions/members');
    return response.data;
  },

  updateStaffMember: async (
    clerkUserId: string,
    data: PermissionFlags
  ): Promise<ApiResponse<{ userId: string; staffPermissions: PermissionFlags }>> => {
    const response = await apiClient.patch(`/staff-permissions/${clerkUserId}`, data);
    return response.data;
  },
};
