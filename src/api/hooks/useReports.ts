import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../queries/reportQueries';
import type { DashboardStats } from '../queries/reportQueries';
import { useMutation } from '@tanstack/react-query';
import { sendReportToBoss } from '../queries/reportQueries';

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });
};

export const useSendReport = () => {
  return useMutation({
    mutationFn: sendReportToBoss,
  });
};