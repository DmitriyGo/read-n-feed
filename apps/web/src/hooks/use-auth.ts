import { useCallback } from 'react';

import { useAuthStore } from '@/store';

export const useAuth = () => {
  const { accessToken, isReady, setAccessToken, setIsReady } = useAuthStore();

  const handleSetAccessToken = (newAccessToken: string) => {
    if (typeof newAccessToken !== 'string' || newAccessToken === '') {
      throw new Error('Incorrect access token!');
    }

    localStorage.setItem('accessToken', newAccessToken);
    setAccessToken(newAccessToken);
  };

  const clearAccessToken = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    console.log('Access token cleared');
    console.log(localStorage.getItem('accessToken'));
  }, [setAccessToken]);

  return {
    isReady,
    accessToken,
    handleSetAccessToken,
    clearAccessToken,
    setIsReady,
  };
};
