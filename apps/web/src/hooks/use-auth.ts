import { useCallback } from 'react';

import { useAuthStore } from '@/store';
import { User } from '@/types/auth.types';

export const useAuth = () => {
  const {
    accessToken,
    user,
    isReady,
    setAccessToken,
    setUser,
    setIsReady,
    clearAuth,
  } = useAuthStore();

  const handleSetAccessToken = useCallback(
    (newAccessToken: string) => {
      if (typeof newAccessToken !== 'string' || newAccessToken === '') {
        throw new Error('Incorrect access token!');
      }

      setAccessToken(newAccessToken);
    },
    [setAccessToken],
  );

  const clearAccessToken = useCallback(() => {
    setAccessToken(null);
    console.log('Access token cleared');
  }, [setAccessToken]);

  const handleSetUser = useCallback(
    (userData: User | null) => {
      setUser(userData);
    },
    [setUser],
  );

  const clearAuthData = useCallback(() => {
    clearAuth();
    console.log('Auth data cleared');
  }, [clearAuth]);

  const isAuthenticated = !!(accessToken && user);

  return {
    // State
    isReady,
    accessToken,
    user,
    isAuthenticated,

    // Actions
    handleSetAccessToken,
    clearAccessToken,
    handleSetUser,
    clearAuthData,
    setIsReady,
  };
};
