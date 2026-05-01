import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { trainingApi } from '../api/training-api';
import type { CreateTrainingData, RecordTrainingPaymentData } from '@/shared/types/common.types';

export function useTrainings(page = 1, limit = 100) {
  return useQuery({
    queryKey: ['trainings', page, limit],
    queryFn: () => trainingApi.getAllTrainings(page, limit),
    staleTime: 2 * 60 * 1000,
  });
}

export function useTraining(id: string) {
  return useQuery({
    queryKey: ['trainings', id],
    queryFn: () => trainingApi.getTrainingById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMemberTrainings(memberId: string) {
  return useQuery({
    queryKey: ['trainings', 'member', memberId],
    queryFn: () => trainingApi.getMemberTrainings(memberId),
    enabled: !!memberId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useActiveTraining(memberId: string) {
  return useQuery({
    queryKey: ['trainings', 'member', memberId, 'active'],
    queryFn: () => trainingApi.getActiveTraining(memberId),
    enabled: !!memberId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useTrainingStats() {
  return useQuery({
    queryKey: ['trainings', 'stats'],
    queryFn: () => trainingApi.getTrainingStats(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTrainingData) =>
      trainingApi.createTraining(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success(response.message || 'Training created successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create training'
      );
    },
  });
}

export function useUpdateTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { notes?: string; autoRenew?: boolean; startDate?: string; endDate?: string; trainerId?: string; discountAmount?: number; trainerFixedPayout?: number | null };
    }) => trainingApi.updateTraining(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['trainings', variables.id] });
      toast.success(response.message || 'Training updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to update training'
      );
    },
  });
}

export function useDeleteTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trainingApi.deleteTraining(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success(response.message || 'Training deleted successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to delete training'
      );
    },
  });
}

export function useCancelTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trainingApi.cancelTraining(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['trainings', id] });
      toast.success(response.message || 'Training cancelled');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to cancel training'
      );
    },
  });
}

export function useFreezeTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trainingApi.freezeTraining(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['trainings', id] });
      toast.success(response.message || 'Training frozen');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to freeze training'
      );
    },
  });
}

export function useUnfreezeTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, extendEndDate = true }: { id: string; extendEndDate?: boolean }) => 
      trainingApi.unfreezeTraining(id, { extendEndDate }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['trainings', variables.id] });
      toast.success(response.message || 'Training unfrozen');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to unfreeze training'
      );
    },
  });
}

export function useDeleteTrainingPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trainingApi.deletePayment(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success(response.message || 'Payment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to delete payment'
      );
    },
  });
}

export function useTrainingDues(trainingId: string) {
  return useQuery({
    queryKey: ['trainings', trainingId, 'dues'],
    queryFn: () => trainingApi.getTrainingDues(trainingId),
    enabled: !!trainingId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecordTrainingPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordTrainingPaymentData) => trainingApi.recordPayment(data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      if (variables.trainingId) {
        queryClient.invalidateQueries({
          queryKey: ['trainings', variables.trainingId, 'dues'],
        });
      }
      toast.success(response.message || 'Payment recorded successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to record payment'
      );
    },
  });
}

export function useExpiringTrainings(days = 7) {
  return useQuery({
    queryKey: ['trainings', 'expiring', days],
    queryFn: () => trainingApi.getExpiringTrainings(days),
    staleTime: 60 * 1000,
  });
}
