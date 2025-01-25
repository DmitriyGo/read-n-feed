import { RegisterDto } from '@read-n-feed/application';
import { useMutation } from '@tanstack/react-query';

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      console.log('Sign in with', data);
      return;
    },
  });
};
