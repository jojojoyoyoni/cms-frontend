import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser } from '../queries/userQueries';
import type { User } from '../../types/user';

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};