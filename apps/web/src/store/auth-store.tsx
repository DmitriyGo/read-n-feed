import { Dispatch } from 'react';
import { create } from 'zustand';

import { User } from '@/types/auth.types';

type AuthStore = {
  accessToken: string | null;
  setAccessToken: Dispatch<string | null>;
  user: User | null;
  setUser: Dispatch<User | null>;
  isReady: boolean;
  setIsReady: Dispatch<boolean>;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  setAccessToken: (value) => set({ accessToken: value }),
  user: null,
  setUser: (value) => set({ user: value }),
  isReady: false,
  setIsReady: (value) => set({ isReady: value }),
  clearAuth: () => set({ accessToken: null, user: null, isReady: true }),
}));
