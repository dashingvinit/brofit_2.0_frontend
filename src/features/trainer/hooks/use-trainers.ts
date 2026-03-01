import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { trainersApi } from '../api/trainers-api';

/**
 * Hook to fetch all trainers in the organization
 */
export function useTrainers() {
  return useQuery({
    queryKey: ['trainers'],
    queryFn: () => trainersApi.getAllTrainers(),
  });
}

/**
 * Hook to create a new trainer
 */
export function useCreateTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => trainersApi.createTrainer(name),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success(response.message || 'Trainer created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create trainer');
    },
  });
}

/**
 * Hook to deactivate a trainer
 */
export function useDeactivateTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trainerId: string) => trainersApi.deactivateTrainer(trainerId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success(response.message || 'Trainer deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate trainer');
    },
  });
}
