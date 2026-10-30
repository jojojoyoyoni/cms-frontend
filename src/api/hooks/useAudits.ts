import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../queries/auditQueries';
import type { AuditLog } from '../queries/auditQueries';

export const useAuditLogs = (caseId?: number | null) => {
  return useQuery<AuditLog[]>({
    queryKey: ['audit-logs', caseId],
    queryFn: () => fetchAuditLogs(caseId || undefined),
    enabled: true, // Always enabled
  });
};