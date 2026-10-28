import client from '../client';
import type { User } from '../../types/user';

export const fetchUsers = async (): Promise<User[]> => {
  const response = await client.get('/users/');
  return response.data;
};

export const createUser = async (userData: { 
  username: string; 
  email: string; 
  password: string; 
  role: string; 
  department?: number | null;
}): Promise<User> => {
  const response = await client.post('/users/', userData);
  return response.data;
};