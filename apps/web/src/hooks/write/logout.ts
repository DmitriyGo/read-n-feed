import { useMutation } from '@tanstack/react-query';

import { ACCESS_TOKEN, ApiRoute } from '@/constants';
import { axiosSecure } from '@/lib';

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      await axiosSecure.get(ApiRoute.Auth.Logout);

      localStorage.removeItem(ACCESS_TOKEN);
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
