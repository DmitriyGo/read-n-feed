import { useCallback } from 'react';

import { useAuthStore } from '@/store';

export const useAuth = () => {
  const { accessToken, isReady, setAccessToken, setIsReady } = useAuthStore();

  const handleSetAccessToken = (newAccessToken: string) => {
    if (typeof newAccessToken !== 'string' || newAccessToken === '') {
      throw new Error('Incorrect access token!');
    }

    setAccessToken(newAccessToken);
  };

  const clearAccessToken = useCallback(() => {
    setAccessToken(null);
  }, [setAccessToken]);

  return {
    isReady,
    accessToken,
    handleSetAccessToken,
    clearAccessToken,
    setIsReady,
  };
};
