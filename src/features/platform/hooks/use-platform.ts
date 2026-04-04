import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { platformApi, type CreateOrgData, type InviteToOrgData } from "../api/platform-api";

const ORGS_KEY = ["platform", "orgs"] as const;

export function useOrgs() {
  return useQuery({
    queryKey: ORGS_KEY,
    queryFn: async () => {
      const res = await platformApi.listOrgs();
      return res.data;
    },
  });
}

export function useOrg(orgId: string) {
  return useQuery({
    queryKey: ["platform", "orgs", orgId],
    queryFn: async () => {
      const res = await platformApi.getOrg(orgId);
      return res.data;
    },
    enabled: !!orgId,
  });
}

export function useOrgMembers(orgId: string) {
  return useQuery({
    queryKey: ["platform", "orgs", orgId, "members"],
    queryFn: async () => {
      const res = await platformApi.listOrgMembers(orgId);
      return res.data;
    },
    enabled: !!orgId,
  });
}

export function useOrgInvitations(orgId: string) {
  return useQuery({
    queryKey: ["platform", "orgs", orgId, "invitations"],
    queryFn: async () => {
      const res = await platformApi.listInvitations(orgId);
      return res.data;
    },
    enabled: !!orgId,
  });
}

export function useCreateOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrgData) => platformApi.createOrg(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ORGS_KEY });
      toast.success(res.message ?? "Organization created");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to create organization");
    },
  });
}

export function useUpdateOrg(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => platformApi.updateOrg(orgId, name),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ORGS_KEY });
      queryClient.invalidateQueries({ queryKey: ["platform", "orgs", orgId] });
      toast.success(res.message ?? "Organization updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to update organization");
    },
  });
}

export function useInviteToOrg(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteToOrgData) => platformApi.inviteToOrg(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform", "orgs", orgId, "invitations"] });
      toast.success("Invitation sent");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to send invitation");
    },
  });
}

export function useSetOrgStatus(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => platformApi.setOrgStatus(orgId, isActive),
    onSuccess: (_, isActive) => {
      queryClient.invalidateQueries({ queryKey: ORGS_KEY });
      queryClient.invalidateQueries({ queryKey: ["platform", "orgs", orgId] });
      toast.success(isActive ? "Organization activated" : "Organization suspended");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to update status");
    },
  });
}

export function useDeleteOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId: string) => platformApi.deleteOrg(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGS_KEY });
      toast.success("Organization deleted");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to delete organization");
    },
  });
}
