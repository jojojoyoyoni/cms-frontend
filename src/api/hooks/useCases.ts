// src/api/hooks/useCases.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCases, createCase, updateCase, deleteCase } from '../queries/caseQueries';
import type { Case } from '../../types/case';
import type { CaseParams } from '../queries/caseQueries';
import { requestCaseClosure, approveCaseClosure, rejectCaseClosure } from '../queries/caseQueries';


export const useCases = (params?: CaseParams) => {
  return useQuery({
    queryKey: ['cases', params],
    queryFn: () => fetchCases(params),
  });
};

export const useCreateCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });
};

export const useUpdateCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Case> }) => updateCase(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });
};

export const useDeleteCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });
};

export const useRequestClosure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number, notes: string }) => requestCaseClosure(id, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });
};

export const useApproveClosure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approveCaseClosure(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });
};

export const useRejectClosure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rejectCaseClosure(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });
};
