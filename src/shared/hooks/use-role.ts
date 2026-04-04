import { useOrganization, useUser } from "@clerk/clerk-react";

export type OrgRole = "org:admin" | "org:staff" | "org:member" | null;

export interface RoleState {
  role: OrgRole;
  isAdmin: boolean;    // org:admin — gym owner, full access
  isStaff: boolean;    // org:staff — receptionist, limited access
  isMember: boolean;   // org:member — gym customer (future member portal)
  isSuperAdmin: boolean; // platform owner (you), set via Clerk publicMetadata
  isLoaded: boolean;
}

export function useRole(): RoleState {
  const { membership, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();

  const role = (membership?.role ?? null) as OrgRole;
  const isSuperAdmin = user?.publicMetadata?.role === "super_admin";

  return {
    role,
    isAdmin: role === "org:admin",
    isStaff: role === "org:staff",
    isMember: role === "org:member",
    isSuperAdmin,
    isLoaded: orgLoaded && userLoaded,
  };
}
