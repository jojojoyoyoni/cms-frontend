import client from '../client';
import type { Task } from '../../types/task';

export const fetchTasks = async (caseId?: number): Promise<Task[]> => {
  const url = caseId ? `/cases/tasks/?case_id=${caseId}` : '/cases/tasks/';
  const response = await client.get(url);
  return response.data;
};

export const createTask = async (data: Partial<Task>): Promise<Task> => {
  const response = await client.post('/cases/tasks/', data);
  return response.data;
};

export const updateTask = async (id: number, data: Partial<Task>): Promise<Task> => {
  const response = await client.patch(`/cases/tasks/${id}/`, data);
  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await client.delete(`/cases/tasks/${id}/`);
};