import client from '../client';
import type { User } from '../../types/user';

export interface AuditLog {
  id: number;
  user: User;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  changes: Record<string, any>;
  timestamp: string;
}

export const fetchAuditLogs = async (caseId: number): Promise<AuditLog[]> => {
  const response = await client.get(`/audits/?case_id=${caseId}`);
  return response.data;
};