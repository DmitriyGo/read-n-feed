import { useMutation } from '@tanstack/react-query';

import { useAuth } from '../../use-auth';

import { ApiRoute } from '@/constants';
import { axiosSecure } from '@/lib';

export const useLogout = () => {
  const { clearAccessToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      clearAccessToken();

      await axiosSecure.post(ApiRoute.Auth.Logout);
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
