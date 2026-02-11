import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { membersApi } from '../api/members-api';
import { membershipsApi } from '../api/memberships-api';
import { trainerAssignmentsApi } from '../api/trainer-assignments-api';
import type { MemberRegistrationData } from '@/shared/types/common.types';

export function useMemberRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MemberRegistrationData & { trainerId?: string }) => {
      // Step 1: Create user
      const userResponse = await membersApi.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: 'member',
      });

      const userId = userResponse.data._id;

      // Step 2: Assign membership
      const membershipResponse = await membershipsApi.assignMembership(userId, {
        planId: data.planId,
        startDate: data.startDate?.toISOString(),
        autoRenew: data.autoRenew,
        amountPaid: data.amountPaid,
        paymentReference: data.paymentReference,
        notes: data.notes,
      });

      // Step 3: Assign trainer if provided
      let trainerAssignment = null;
      if (data.trainerId) {
        const assignmentResponse = await trainerAssignmentsApi.assignTrainer({
          memberId: userId,
          trainerId: data.trainerId,
          startDate: data.startDate?.toISOString(),
        });
        trainerAssignment = assignmentResponse.data;
      }

      return {
        user: userResponse.data,
        membership: membershipResponse.data,
        trainerAssignment,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-assignments'] });
      toast.success('Member registered successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to register member';
      toast.error(message);
    },
  });
}
