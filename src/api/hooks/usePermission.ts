import { useAuthStore } from '../../store/slices/authSlice';

export const useHasPermission = (permission: string): boolean => {
  const user = useAuthStore((state) => state.user);
  return user?.permissions?.includes(permission) || false;
};