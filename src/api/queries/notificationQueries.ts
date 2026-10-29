import client from '../client';

export interface AppNotification {
  id: number;
  message: string;
  case_id: number | null;
  is_read: boolean;
  created_at: string;
}

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  const response = await client.get('/notifications/');
  return response.data;
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await client.post(`/notifications/${id}/mark_read/`);
};