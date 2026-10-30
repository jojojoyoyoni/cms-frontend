import client from '../client';
import type { Organization } from '../../types/organization';

export const fetchOrganizations = async (): Promise<Organization[]> => {
  const response = await client.get('/users/organizations/');
  return response.data;
};

export const createOrganization = async (data: FormData): Promise<Organization> => {
  const response = await client.post('/users/organizations/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateOrganization = async (id: number, data: FormData): Promise<Organization> => {
  const response = await client.patch(`/users/organizations/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};