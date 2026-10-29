import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markNotificationRead } from '../queries/notificationQueries';
import type { AppNotification } from '../queries/notificationQueries';
import { useWebSocket } from '../../context/WebSocketContext';
import { useEffect } from 'react';

export const useNotifications = () => {
  const { lastMessage } = useWebSocket();
  const queryClient = useQueryClient();

  const query = useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  useEffect(() => {
    if (lastMessage) {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  }, [lastMessage, queryClient]);

  return query;
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};