import client from '../client';

export interface DashboardStats {
  total_cases: number;
  open_cases: number;
  in_progress_cases: number;
  closed_cases: number;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await client.get('/reports/dashboard/');
  return response.data;
};