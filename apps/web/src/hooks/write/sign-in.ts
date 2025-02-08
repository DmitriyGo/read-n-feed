import { LoginDto } from '@read-n-feed/application';
import { useMutation } from '@tanstack/react-query';

import { ACCESS_TOKEN, ApiRoute } from '@/constants';
import { axiosSecure } from '@/lib';

export const useSignIn = () => {
  return useMutation({
    mutationFn: async (data: LoginDto) => {
      const response = await axiosSecure.post<{
        accessToken: string;
      }>(ApiRoute.Auth.Login, data);

      localStorage.setItem(ACCESS_TOKEN, response.data.accessToken);
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
