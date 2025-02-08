import { useCallback, useLayoutEffect } from 'react';

import { ACCESS_TOKEN, ApiRoute } from '@/constants';
import { axiosSecure, isEmpty } from '@/lib';
import { useAuthStore } from '@/store';

export const useAuth = () => {
  const { accessToken, isReady, setAccessToken, setIsReady } = useAuthStore();

  const handleSetAccessToken = (newAccessToken: string) => {
    if (typeof newAccessToken !== 'string' || newAccessToken === '') {
      throw new Error('Incorrect access token!');
    }

    setAccessToken(newAccessToken);
    localStorage.setItem(ACCESS_TOKEN, newAccessToken);
    setIsReady(false);
  };

  const clearAccessToken = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem(ACCESS_TOKEN);
    setIsReady(false);
  }, [setAccessToken, setIsReady]);

  useLayoutEffect(() => {
    (async () => {
      if (isReady) {
        return;
      }

      const newAccessToken = localStorage.getItem(ACCESS_TOKEN);

      if (isEmpty(newAccessToken)) {
        setIsReady(true);
        return;
      }

      setAccessToken(newAccessToken);

      try {
        await axiosSecure(ApiRoute.Users.Me);

        setIsReady(true);
      } catch {
        clearAccessToken();
      }
    })();
  }, [clearAccessToken, isReady, setAccessToken, setIsReady]);

  return {
    isReady,
    accessToken,
    handleSetAccessToken,
    clearAccessToken,
  };
};
