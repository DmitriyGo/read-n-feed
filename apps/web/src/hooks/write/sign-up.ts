import { RegisterDto } from '@read-n-feed/application';
import { User } from '@read-n-feed/domain';
import { useMutation } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { axiosSecure } from '@/lib';

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      await axiosSecure.post<User>(ApiRoute.Auth.Register, data);
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
