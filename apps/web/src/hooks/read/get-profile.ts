import { UserResponseDto } from '@read-n-feed/application';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useGetProfile = () => {
  return useQuery({
    queryKey: [QueryKey.GetProfile],
    queryFn: async () => {
      return axiosSecure.get<UserResponseDto>(ApiRoute.Users.Me);
    },
  });
};
