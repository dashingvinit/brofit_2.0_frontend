import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '../api/users-api';
import { membershipPlansApi } from '@/features/plans/api/membership-plans-api';
import { trainingPlansApi } from '@/features/plans/api/training-plans-api';
import type { MemberRegistrationData } from '@/shared/types/common.types';

/**
 * Calculate end date from start date and duration in days
 */
function calculateEndDate(startDate: Date, durationDays: number): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  endDate.setHours(23, 59, 59, 999); // Set to end of day
  return endDate;
}

export function useMemberRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MemberRegistrationData & { durationDays?: number }) => {
      // Step 1: Create user
      const userResponse = await usersApi.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: 'member',
      });

      const userId = userResponse.data.id;

      // Step 2: Optionally add membership to user if planId is provided
      if (data.planId) {
        const startDate = data.startDate || new Date();
        const endDate = data.durationDays
          ? calculateEndDate(startDate, data.durationDays)
          : calculateEndDate(startDate, 365); // Default 1 year

        await membershipPlansApi.addMembershipToUser(userId, {
          planId: data.planId,
          planName: data.planName || 'Membership', // Fallback if not provided
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: 'active',
          amountPaid: data.amountPaid,
          paymentReference: data.paymentReference,
        });
      }

      // Step 3: Optionally add training plan if trainerId provided
      if (data.trainerId && data.trainerName) {
        const startDate = data.startDate || new Date();
        await trainingPlansApi.addTrainingToUser(userId, {
          planName: 'Initial Training',
          trainerId: data.trainerId,
          trainerName: data.trainerName,
          startDate: startDate.toISOString(),
          status: 'active',
          notes: data.notes,
        });
      }

      return userResponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Member registered successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to register member';
      toast.error(message);
    },
  });
}
