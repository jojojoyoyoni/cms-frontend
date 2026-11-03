import client from '../client';
import type { Case } from '../../types/case';

export interface PaginatedCases {
  count: number;
  next: string | null;
  previous: string | null;
  results: Case[];
}

export interface CaseParams {
  page?: number;
  search?: string;
  status?: string;
  priority?: string;
  ordering?: string;
}

export const fetchCases = async (params?: CaseParams): Promise<PaginatedCases> => {
  const response = await client.get('/cases/', { params });
  return response.data;
};

export const createCase = async (caseData: Partial<Case>): Promise<Case> => {
  const response = await client.post('/cases/', caseData);
  return response.data;
};

export const updateCase = async (id: number, caseData: Partial<Case>): Promise<Case> => {
  const response = await client.patch(`/cases/${id}/`, caseData);
  return response.data;
};

export const deleteCase = async (id: number): Promise<void> => {
  await client.delete(`/cases/${id}/`);
};

export const requestCaseClosure = async (id: number, notes: string): Promise<void> => {
  await client.post(`/cases/${id}/request_closure/`, { resolution_notes: notes });
};

export const approveCaseClosure = async (id: number): Promise<void> => {
  await client.post(`/cases/${id}/approve_closure/`);
};

export const rejectCaseClosure = async (id: number): Promise<void> => {
  await client.post(`/cases/${id}/reject_closure/`);
};