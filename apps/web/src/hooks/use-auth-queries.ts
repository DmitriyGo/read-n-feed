import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { authApi } from '@/api/auth.api';
import { QueryKey, Route } from '@/constants';
import { useAuth } from '@/hooks/use-auth';

export const useLogoutAll = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearAuthData } = useAuth();

  return useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSuccess: () => {
      clearAuthData();
      queryClient.clear();
      toast.success('Logged out from all devices');
      navigate(Route.Home);
    },
    onError: () => {
      clearAuthData();
      queryClient.clear();
      navigate(Route.Home);
    },
  });
};

export const useCurrentUser = () => {
  const { handleSetUser, accessToken } = useAuth();

  const query = useQuery({
    queryKey: [QueryKey.Auth.Profile],
    queryFn: authApi.getCurrentUser,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      handleSetUser(query.data);
    } else if (query.isError) {
      console.error('Failed to fetch current user:', query.error);
      handleSetUser(null);
    }
  }, [query.isSuccess, query.isError, query.data, query.error, handleSetUser]);

  return query;
};

export const useSessions = () => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.Auth.Sessions],
    queryFn: authApi.getSessions,
    enabled: !!accessToken,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKey.Auth.Sessions] });
      toast.success('Session revoked successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to revoke session';
      toast.error(message);
    },
  });
};
