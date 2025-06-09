import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/api/auth.api';
import { RegisterDto } from '@/types/auth.types';

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      return await authApi.register(data);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed';
      console.error('Sign-up error:', error);
      throw new Error(message);
    },
  });
};
