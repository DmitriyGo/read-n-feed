import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { useAuth } from '../../use-auth';

import { authApi } from '@/api/auth.api';
import { QueryKey } from '@/constants';
import { LoginDto } from '@/types/auth.types';

export const useSignIn = () => {
  const { handleSetAccessToken, handleSetUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginDto) => {
      const response = await authApi.login(data);

      handleSetAccessToken(response.accessToken);

      try {
        const userData = await authApi.getCurrentUser();
        handleSetUser(userData);

        // Invalidate auth-related queries
        queryClient.invalidateQueries({ queryKey: [QueryKey.Auth.Profile] });
        queryClient.invalidateQueries({ queryKey: [QueryKey.Auth.Sessions] });

        return response;
      } catch (error) {
        throw new Error('Failed to fetch user data after login');
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Login failed';
      console.error('Sign-in error:', error);
      throw new Error(message);
    },
  });
};
