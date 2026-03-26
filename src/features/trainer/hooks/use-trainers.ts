import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { trainersApi } from '../api/trainers-api';
import type { RecordTrainerPayoutData } from '@/shared/types/common.types';

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
 * Hook to fetch a trainer with their active clients
 */
export function useTrainerWithClients(trainerId: string) {
  return useQuery({
    queryKey: ['trainers', trainerId, 'clients'],
    queryFn: () => trainersApi.getTrainerWithClients(trainerId),
    enabled: !!trainerId,
  });
}

/**
 * Hook to create a new trainer
 */
export function useCreateTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; splitPercent?: number }) => trainersApi.createTrainer(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success(response.message || 'Trainer created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create trainer');
    },
  });
}

export function useUpdateTrainer(trainerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; splitPercent?: number }) =>
      trainersApi.updateTrainer(trainerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      queryClient.invalidateQueries({ queryKey: ['trainers', trainerId, 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['trainers', trainerId, 'payout-schedule'] });
      toast.success('Trainer updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update trainer');
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

/**
 * Hook to fetch the payout schedule for a trainer
 */
export function useTrainerPayoutSchedule(trainerId: string) {
  return useQuery({
    queryKey: ['trainers', trainerId, 'payout-schedule'],
    queryFn: () => trainersApi.getPayoutSchedule(trainerId),
    enabled: !!trainerId,
  });
}

/**
 * Hook to record a cash payout for a trainer client-month
 */
export function useRecordTrainerPayout(trainerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordTrainerPayoutData) =>
      trainersApi.recordPayout(trainerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers', trainerId, 'payout-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['trainers', 'payout-summary'] });
      toast.success('Payout recorded');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record payout');
    },
  });
}

/**
 * Hook to fetch outstanding payout summary for all trainers in the org
 */
export function useTrainerOutstandingSummary() {
  return useQuery({
    queryKey: ['trainers', 'payout-summary'],
    queryFn: () => trainersApi.getOutstandingSummary(),
  });
}
