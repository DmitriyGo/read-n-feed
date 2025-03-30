import { UserResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { useAuth } from '@/hooks/use-auth';
import { axiosSecure } from '@/lib';

export const useGetProfile = () => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.GetProfile, accessToken],
    queryFn: async () => {
      return axiosSecure.get<UserResponseDto>(ApiRoute.Users.Me);
    },
    enabled: isDefined(accessToken),
  });
};
