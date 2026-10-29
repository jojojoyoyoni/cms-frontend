import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCaseDocuments, uploadCaseDocument } from '../queries/caseDocumentQueries';
import type { CaseDocument } from '../../types/caseDocument';

export const useCaseDocuments = (caseId: number) => {
  return useQuery<CaseDocument[]>({
    queryKey: ['case-documents', caseId],
    queryFn: () => fetchCaseDocuments(caseId),
    enabled: !!caseId,
  });
};

export const useUploadCaseDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadCaseDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-documents'] });
    },
  });
};