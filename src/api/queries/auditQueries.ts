import client from '../client';

export interface AuditLog {
  id: number;
  user: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  changes: Record<string, any>;
  timestamp: string;
  case_number: string | null; // Add this
  case_title: string | null;   // Add this
}

export const fetchAuditLogs = async (caseId?: number): Promise<AuditLog[]> => {
  const url = caseId ? `/audits/?case_id=${caseId}` : '/audits/';
  const response = await client.get(url);
  return response.data;
};