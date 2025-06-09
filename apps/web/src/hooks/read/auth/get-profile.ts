import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { authApi } from '@/api/auth.api';
import { QueryKey } from '@/constants';
import { useAuth } from '@/hooks/use-auth';

export const useGetProfile = () => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.Users.Profile, accessToken],
    queryFn: async () => {
      const userData = await authApi.getCurrentUser();
      return { data: userData };
    },
    enabled: isDefined(accessToken),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
