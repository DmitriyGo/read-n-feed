import { UserResponseDto } from '@read-n-feed/application';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../use-auth';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure, isNotEmpty } from '@/lib';

export const useGetProfile = () => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.GetProfile, accessToken],
    queryFn: async () => {
      return axiosSecure.get<UserResponseDto>(ApiRoute.Users.Me);
    },
    enabled: isNotEmpty(accessToken),
  });
};
