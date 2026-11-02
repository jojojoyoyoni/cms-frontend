import { useQuery } from '@tanstack/react-query';
import { fetchDepartments } from '../queries/departmentQueries';
import type { Department } from '../../types/department';

export const useDepartments = () => {
  return useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });
};