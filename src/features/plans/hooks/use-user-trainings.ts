import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingPlansApi } from '../api/training-plans-api';
import { toast } from 'sonner';

/**
 * Hook to add a training plan to a user
 */
export function useAddUserTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      trainingPlansApi.addTrainingToUser(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Training plan added successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to add training plan';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a user's training plan
 */
export function useUpdateUserTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, trainingId, data }: { userId: string; trainingId: string; data: any }) =>
      trainingPlansApi.updateUserTraining(userId, trainingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Training plan updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update training plan';
      toast.error(message);
    },
  });
}

/**
 * Hook to remove a training plan from a user
 */
export function useRemoveUserTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, trainingId }: { userId: string; trainingId: string }) =>
      trainingPlansApi.removeUserTraining(userId, trainingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Training plan removed successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to remove training plan';
      toast.error(message);
    },
  });
}
