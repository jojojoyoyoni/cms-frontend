import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrganizations, createOrganization, updateOrganization } from '../queries/organizationQueries';
import type { Organization } from '../../types/organization';

export const useOrganizations = () => {
  return useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => createOrganization(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: FormData }) => updateOrganization(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
  });
};