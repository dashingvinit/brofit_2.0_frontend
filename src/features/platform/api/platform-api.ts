import { apiClient } from "@/shared/lib/api-client";
import type {
  ApiResponse,
  Organization,
  ClerkOrgMember,
  ClerkOrgInvitation,
} from "@/shared/types/common.types";

export interface CreateOrgData {
  name: string;
  ownerEmail?: string;
}

export interface InviteToOrgData {
  emailAddress: string;
  role: "org:admin" | "org:staff";
}

export const platformApi = {
  /** GET /platform/orgs */
  listOrgs: async (): Promise<ApiResponse<Organization[]>> => {
    const res = await apiClient.get("/platform/orgs");
    return res.data;
  },

  /** GET /platform/orgs/:id */
  getOrg: async (orgId: string): Promise<ApiResponse<Organization>> => {
    const res = await apiClient.get(`/platform/orgs/${orgId}`);
    return res.data;
  },

  /** POST /platform/orgs */
  createOrg: async (data: CreateOrgData): Promise<ApiResponse<Organization>> => {
    const res = await apiClient.post("/platform/orgs", data);
    return res.data;
  },

  /** PATCH /platform/orgs/:id */
  updateOrg: async (orgId: string, name: string): Promise<ApiResponse<Organization>> => {
    const res = await apiClient.patch(`/platform/orgs/${orgId}`, { name });
    return res.data;
  },

  /** PATCH /platform/orgs/:id/status */
  setOrgStatus: async (orgId: string, isActive: boolean): Promise<ApiResponse<Organization>> => {
    const res = await apiClient.patch(`/platform/orgs/${orgId}/status`, { isActive });
    return res.data;
  },

  /** DELETE /platform/orgs/:id */
  deleteOrg: async (orgId: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete(`/platform/orgs/${orgId}`);
    return res.data;
  },

  /** GET /platform/orgs/:id/members */
  listOrgMembers: async (orgId: string): Promise<ApiResponse<ClerkOrgMember[]>> => {
    const res = await apiClient.get(`/platform/orgs/${orgId}/members`);
    return res.data;
  },

  /** POST /platform/orgs/:id/invite */
  inviteToOrg: async (
    orgId: string,
    data: InviteToOrgData,
  ): Promise<ApiResponse<ClerkOrgInvitation>> => {
    const res = await apiClient.post(`/platform/orgs/${orgId}/invite`, data);
    return res.data;
  },

  /** GET /platform/orgs/:id/invitations */
  listInvitations: async (orgId: string): Promise<ApiResponse<ClerkOrgInvitation[]>> => {
    const res = await apiClient.get(`/platform/orgs/${orgId}/invitations`);
    return res.data;
  },
};
