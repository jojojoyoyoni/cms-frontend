import client from '../client';
import type { CaseDocument } from '../../types/caseDocument';

export const fetchCaseDocuments = async (caseId: number): Promise<CaseDocument[]> => {
  const response = await client.get(`/cases/documents/?case_id=${caseId}`);
  return response.data;
};

export const uploadCaseDocument = async (formData: FormData): Promise<CaseDocument> => {
  const response = await client.post('/cases/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};