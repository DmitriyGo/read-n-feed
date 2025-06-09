import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../../use-auth';

import { authApi } from '@/api/auth.api';

export const useLogout = () => {
  const { clearAuthData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSuccess: () => {
      clearAuthData();
      queryClient.clear();
    },
    onError: (error: any) => {
      // Even if logout fails on server, clear local state
      clearAuthData();
      queryClient.clear();
      console.error('Logout error:', error);
    },
  });
};
