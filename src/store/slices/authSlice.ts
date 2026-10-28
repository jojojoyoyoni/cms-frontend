// src/store/slices/authSlice.ts
import { create } from 'zustand';
import client from '../../api/client';
import type { User } from '../../types/user';

interface AuthState {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (username: string, password: string) => {
    const tokenRes = await client.post('/auth/login/', { username, password });
    localStorage.setItem('access_token', tokenRes.data.access);
    localStorage.setItem('refresh_token', tokenRes.data.refresh);

    const userRes = await client.get('/users/me/', {
      headers: { Authorization: `Bearer ${tokenRes.data.access}` }
    });
    set({ user: userRes.data });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null });
  },
}));