import client from '../client';
import type { User } from '../../types/user';

export const loginApi = async (username: string, password: string) => {
  const response = await client.post('/auth/login/', { username, password });
  return response.data; // returns { access, refresh }
};

export const getMeApi = async (token: string): Promise<User> => {
  const response = await client.get('/users/me/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
