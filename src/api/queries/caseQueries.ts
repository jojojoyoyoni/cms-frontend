import client from '../client';
import type { Case } from '../../types/case';

export const fetchCases = async (): Promise<Case[]> => {
  const response = await client.get('/cases/');
  return response.data;
};

export const createCase = async (caseData: { title: string; description: string; status: string }): Promise<Case> => {
  const response = await client.post('/cases/', caseData);
  return response.data;
};

export const updateCase = async (id: string, caseData: { title: string; description: string; status: string }): Promise<Case> => {
  const response = await client.put(`/cases/${id}`, caseData);
  return response.data;
};

export const deleteCase = async (id: string): Promise<void> => {
  await client.delete(`/cases/${id}`);
};