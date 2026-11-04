import client from '../client';
import type { User } from '../../types/user';

export const updateProfile = async (data: FormData): Promise<User> => {
  const response = await client.patch('/users/me/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const changePassword = async (data: { old_password: string; new_password: string }): Promise<void> => {
  await client.post('/users/change-password/', data);
};