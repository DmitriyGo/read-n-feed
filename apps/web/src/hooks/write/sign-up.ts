import { RegisterDto } from '@read-n-feed/application';
import { useMutation } from '@tanstack/react-query';

import { ApiRoute } from '@/constants/api-routes';
import { axiosSecure } from '@/lib';

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      await axiosSecure.post(ApiRoute.Auth.Register, data);
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
