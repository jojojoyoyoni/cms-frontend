import client from '../client';
import type { Department } from '../../types/department';

export const fetchDepartments = async (): Promise<Department[]> => {
  const response = await client.get('/users/departments/');
  return response.data;
};