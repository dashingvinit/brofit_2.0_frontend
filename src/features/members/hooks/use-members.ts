import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members-api';

export function useMembers(page = 1, limit = 100) {
  return useQuery({
    queryKey: ['members', page, limit],
    queryFn: () => membersApi.getMembers(page, limit),
    select: (response) => response.data,
  });
}
