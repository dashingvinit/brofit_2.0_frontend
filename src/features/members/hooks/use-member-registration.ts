import { useCreateMember } from './use-members';

/**
 * Hook for member registration
 * Simplified to use the useCreateMember hook
 * Note: Membership and training plan assignment should be done separately
 */
export function useMemberRegistration() {
  const createMember = useCreateMember();

  return {
    createMember: createMember.mutate,
    createMemberAsync: createMember.mutateAsync,
    isLoading: createMember.isPending,
    isSuccess: createMember.isSuccess,
    isError: createMember.isError,
    error: createMember.error,
  };
}
