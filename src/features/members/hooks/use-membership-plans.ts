import { useQuery } from '@tanstack/react-query';
import { membershipsApi } from '../api/memberships-api';

export function useMembershipPlans() {
  return useQuery({
    queryKey: ['membership-plans'],
    queryFn: () => membershipsApi.getActivePlans(),
    select: (response) => response.data,
  });
}
