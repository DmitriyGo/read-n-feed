import { useMutation } from '@tanstack/react-query';

import { useAuth } from '../use-auth';

import { ApiRoute } from '@/constants';
import { axiosSecure } from '@/lib';

export const useLogout = () => {
  const { clearAccessToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      await axiosSecure.get(ApiRoute.Auth.Logout);

      clearAccessToken();
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
