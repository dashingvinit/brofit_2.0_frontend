import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { membersApi } from '../api/members-api';
import type { UpdateUserData } from '../api/users-api';

export function useUserManagement() {
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserData }) =>
      membersApi.updateUser(userId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Member updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update member';
      toast.error(message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => membersApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Member deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete member';
      toast.error(message);
    },
  });

  return {
    updateUser: (userId: string, data: UpdateUserData) =>
      updateUserMutation.mutateAsync({ userId, data }),
    deleteUser: (userId: string) => deleteUserMutation.mutateAsync(userId),
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
}
