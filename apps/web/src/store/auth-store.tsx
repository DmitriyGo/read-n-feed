import { Dispatch } from 'react';
import { create } from 'zustand';

type AuthStore = {
  accessToken: string | null;
  setAccessToken: Dispatch<string | null>;
  isReady: boolean;
  setIsReady: Dispatch<boolean>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  setAccessToken: (value) => set({ accessToken: value }),
  isReady: false,
  setIsReady: (value) => set({ isReady: value }),
}));
