import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members-api';

export function useTrainers() {
  return useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      // Get all users and filter for trainers
      const response = await membersApi.getMembers(1, 100);
      const trainers = response.data.filter((user) => user.role === 'trainer');
      return trainers;
    },
  });
}
