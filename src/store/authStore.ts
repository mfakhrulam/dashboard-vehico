import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth.types';
import { STORAGE_KEYS, TOKEN_KEYS } from '@/config/constants';
import { storage } from '@/utils/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setTokens: (accessToken, refreshToken) => {
        storage.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
        storage.set(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
      },

      logout: () => {
        storage.remove(TOKEN_KEYS.ACCESS_TOKEN);
        storage.remove(TOKEN_KEYS.REFRESH_TOKEN);
        storage.remove(STORAGE_KEYS.USER);
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
