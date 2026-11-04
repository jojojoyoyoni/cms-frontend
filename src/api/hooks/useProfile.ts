import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile, changePassword } from '../queries/profileQueries';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};