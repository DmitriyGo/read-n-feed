import { LoginDto } from '@read-n-feed/application';
import { useMutation } from '@tanstack/react-query';

export const useSignIn = () => {
  return useMutation({
    mutationFn: async (data: LoginDto) => {
      console.log('Sign in with', data);
      return;
    },
  });
};
