import { LoginDto } from '@read-n-feed/application';
import { useMutation } from '@tanstack/react-query';

import { ApiRoute } from '@/constants/api-routes';
import { env } from '@/env';
import { axiosSecure } from '@/lib';

export const useSignIn = () => {
  return useMutation({
    mutationFn: async (data: LoginDto) => {
      console.log('data', env.VITE_API_URL);
      await axiosSecure.post(ApiRoute.Auth.Login, data);
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
