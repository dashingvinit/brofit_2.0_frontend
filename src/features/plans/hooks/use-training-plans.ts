import { trainingPlansApi } from '../api/training-plans-api';
import { createPlanHooks } from './use-plan-hooks-factory';
import type { TrainingPlan } from '@/shared/types/common.types';

const hooks = createPlanHooks<TrainingPlan, any, any>({
  queryKey: 'training-plans',
  planName: 'Training plan',
  api: trainingPlansApi,
});

export const useTrainingPlans = hooks.useActivePlans;
export const useAllTrainingPlans = hooks.useAllPlans;
export const useTrainingPlan = hooks.usePlanById;
export const useCreateTrainingPlan = hooks.useCreatePlan;
export const useUpdateTrainingPlan = hooks.useUpdatePlan;
export const useDeactivateTrainingPlan = hooks.useDeactivatePlan;
