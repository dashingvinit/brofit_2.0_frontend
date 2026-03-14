import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attendanceApi } from '../api/attendance-api';

const KEYS = {
  all: ['attendance'] as const,
  inside: () => ['attendance', 'inside'] as const,
  stats: () => ['attendance', 'stats'] as const,
  byDate: (date?: string) => ['attendance', 'date', date ?? 'today'] as const,
  memberHistory: (memberId: string, page: number, limit: number) =>
    ['attendance', 'member', memberId, page, limit] as const,
};

export function useAttendanceInside() {
  return useQuery({
    queryKey: KEYS.inside(),
    queryFn: () => attendanceApi.getCurrentlyInside(),
    refetchInterval: 30_000, // auto-refresh every 30s
  });
}

export function useAttendanceTodayStats() {
  return useQuery({
    queryKey: KEYS.stats(),
    queryFn: () => attendanceApi.getTodayStats(),
    refetchInterval: 30_000,
  });
}

export function useAttendanceByDate(date?: string) {
  return useQuery({
    queryKey: KEYS.byDate(date),
    queryFn: () => attendanceApi.getByDate(date),
  });
}

export function useAttendanceMemberHistory(memberId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: KEYS.memberHistory(memberId, page, limit),
    queryFn: () => attendanceApi.getMemberHistory(memberId, page, limit),
    enabled: !!memberId,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, notes }: { memberId: string; notes?: string }) =>
      attendanceApi.checkIn(memberId, notes),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      toast.success(response.message || 'Check-in recorded');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check in');
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attendanceId: string) => attendanceApi.checkOut(attendanceId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      toast.success(response.message || 'Check-out recorded');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check out');
    },
  });
}
