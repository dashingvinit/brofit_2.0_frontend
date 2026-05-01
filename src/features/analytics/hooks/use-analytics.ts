import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics-api';

export function useTopPlans(months = 6) {
  return useQuery({
    queryKey: ['analytics', 'top-plans', months],
    queryFn: () => analyticsApi.getTopPlans(months),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRetention() {
  return useQuery({
    queryKey: ['analytics', 'retention'],
    queryFn: () => analyticsApi.getRetention(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenueBreakdown(months = 6) {
  return useQuery({
    queryKey: ['analytics', 'revenue-breakdown', months],
    queryFn: () => analyticsApi.getRevenueBreakdown(months),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['analytics', 'payment-methods'],
    queryFn: () => analyticsApi.getPaymentMethods(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrainerPerformance() {
  return useQuery({
    queryKey: ['analytics', 'trainer-performance'],
    queryFn: () => analyticsApi.getTrainerPerformance(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMemberGrowth(months = 12) {
  return useQuery({
    queryKey: ['analytics', 'member-growth', months],
    queryFn: () => analyticsApi.getMemberGrowth(months),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDemographics() {
  return useQuery({
    queryKey: ['analytics', 'demographics'],
    queryFn: () => analyticsApi.getDemographics(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMembershipDurationPreference() {
  return useQuery({
    queryKey: ['analytics', 'membership-duration-preference'],
    queryFn: () => analyticsApi.getMembershipDurationPreference(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUnitEconomics(window = 3) {
  return useQuery({
    queryKey: ['analytics', 'unit-economics', window],
    queryFn: () => analyticsApi.getUnitEconomics(window),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProjection(window = 3, horizon = 12) {
  return useQuery({
    queryKey: ['analytics', 'projection', window, horizon],
    queryFn: () => analyticsApi.getProjection(window, horizon),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDiscounts(months = 6) {
  return useQuery({
    queryKey: ['analytics', 'discounts', months],
    queryFn: () => analyticsApi.getDiscounts(months),
    staleTime: 5 * 60 * 1000,
  });
}
