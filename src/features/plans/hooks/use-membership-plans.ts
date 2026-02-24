import { membershipPlansApi } from '../api/membership-plans-api';
import { createPlanHooks } from './use-plan-hooks-factory';
import type { MembershipPlan } from '@/shared/types/common.types';

const hooks = createPlanHooks<MembershipPlan, any, any>({
  queryKey: 'membership-plans',
  planName: 'Membership plan',
  api: membershipPlansApi,
});

export const useMembershipPlans = hooks.useActivePlans;
export const useAllMembershipPlans = hooks.useAllPlans;
export const useMembershipPlan = hooks.usePlanById;
export const useCreateMembershipPlan = hooks.useCreatePlan;
export const useUpdateMembershipPlan = hooks.useUpdatePlan;
export const useDeactivateMembershipPlan = hooks.useDeactivatePlan;
