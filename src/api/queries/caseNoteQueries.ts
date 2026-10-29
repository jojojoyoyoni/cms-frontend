import client from '../client';
import type { CaseNote } from '../../types/caseNote';

export const fetchCaseNotes = async (caseId: number): Promise<CaseNote[]> => {
  const response = await client.get(`/cases/notes/?case_id=${caseId}`);
  return response.data;
};

export const createCaseNote = async (noteData: { 
  case: number; 
  content: string; 
  is_internal: boolean;
}): Promise<CaseNote> => {
  const response = await client.post('/cases/notes/', noteData);
  return response.data;
};