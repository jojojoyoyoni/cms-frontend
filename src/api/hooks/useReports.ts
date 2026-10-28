import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../queries/reportQueries';
import type { DashboardStats } from '../queries/reportQueries';

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });
};