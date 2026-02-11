import { useMutation } from '@tanstack/react-query';
import { usersApi } from '../api/users-api';
import { toast } from 'sonner';

/**
 * Hook to sync the current user to the database
 * Useful when a user signs in for the first time or after Clerk webhook fails
 */
export function useUserSync() {
  return useMutation({
    mutationFn: usersApi.syncCurrentUser,
    onSuccess: () => {
      toast.success('User profile synced successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to sync user profile');
    },
  });
}
