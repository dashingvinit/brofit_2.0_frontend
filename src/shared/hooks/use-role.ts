import { useOrganization } from "@clerk/clerk-react";

export function useRole(): { role: string | null; isAdmin: boolean; isLoaded: boolean } {
  const { membership, isLoaded } = useOrganization();
  const role = membership?.role ?? null;
  return {
    role,
    // Clerk's default admin role key is "org:admin"
    isAdmin: role === "org:admin",
    isLoaded,
  };
}
