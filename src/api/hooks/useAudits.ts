// src/api/hooks/useAudits.ts
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../queries/auditQueries';
import type { AuditLog } from '../queries/auditQueries';

export const useAuditLogs = (caseId: number | null) => {
  return useQuery<AuditLog[]>({
    queryKey: ['audit-logs', caseId],
    queryFn: () => {
      if (!caseId) return [];
      return fetchAuditLogs(caseId);
    },
    enabled: !!caseId,
  });
};