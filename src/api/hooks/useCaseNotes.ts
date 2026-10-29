import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCaseNotes, createCaseNote } from '../queries/caseNoteQueries';
import type { CaseNote } from '../../types/caseNote';

export const useCaseNotes = (caseId: number | null) => {
  return useQuery<CaseNote[]>({
    queryKey: ['case-notes', caseId],
    queryFn: () => {
      if (!caseId) return [];
      return fetchCaseNotes(caseId);
    },
    enabled: !!caseId,
  });
};

export const useCreateCaseNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCaseNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-notes'] });
    },
  });
};