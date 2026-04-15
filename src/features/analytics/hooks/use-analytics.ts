import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics-api';

export function useTopPlans(months = 6) {
  return useQuery({
    queryKey: ['analytics', 'top-plans', months],
    queryFn: () => analyticsApi.getTopPlans(months),
  });
}

export function useRetention() {
  return useQuery({
    queryKey: ['analytics', 'retention'],
    queryFn: () => analyticsApi.getRetention(),
  });
}

export function useRevenueBreakdown(months = 6) {
  return useQuery({
    queryKey: ['analytics', 'revenue-breakdown', months],
    queryFn: () => analyticsApi.getRevenueBreakdown(months),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['analytics', 'payment-methods'],
    queryFn: () => analyticsApi.getPaymentMethods(),
  });
}

export function useTrainerPerformance() {
  return useQuery({
    queryKey: ['analytics', 'trainer-performance'],
    queryFn: () => analyticsApi.getTrainerPerformance(),
  });
}

export function useMemberGrowth(months = 12) {
  return useQuery({
    queryKey: ['analytics', 'member-growth', months],
    queryFn: () => analyticsApi.getMemberGrowth(months),
  });
}

export function useDemographics() {
  return useQuery({
    queryKey: ['analytics', 'demographics'],
    queryFn: () => analyticsApi.getDemographics(),
  });
}

export function useMembershipDurationPreference() {
  return useQuery({
    queryKey: ['analytics', 'membership-duration-preference'],
    queryFn: () => analyticsApi.getMembershipDurationPreference(),
  });
}

export function useUnitEconomics(window = 3) {
  return useQuery({
    queryKey: ['analytics', 'unit-economics', window],
    queryFn: () => analyticsApi.getUnitEconomics(window),
  });
}

export function useProjection(window = 3, horizon = 12, fixedCost?: number) {
  return useQuery({
    queryKey: ['analytics', 'projection', window, horizon, fixedCost ?? 'auto'],
    queryFn: () => analyticsApi.getProjection(window, horizon, fixedCost),
  });
}

export function useDiscounts(months = 6) {
  return useQuery({
    queryKey: ['analytics', 'discounts', months],
    queryFn: () => analyticsApi.getDiscounts(months),
  });
}
