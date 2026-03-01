import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports-api';

/**
 * Hook to fetch dues report for a specific member
 */
export function useMemberDues(memberId: string) {
  return useQuery({
    queryKey: ['reports', 'dues', memberId],
    queryFn: () => reportsApi.getMemberDues(memberId),
    enabled: !!memberId,
  });
}

/**
 * Hook to fetch all members with outstanding dues
 */
export function useDuesReport(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['reports', 'dues', 'all', page, limit],
    queryFn: () => reportsApi.getAllDues(page, limit),
  });
}
