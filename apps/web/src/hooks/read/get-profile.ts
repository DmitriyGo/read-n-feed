import { UserResponseDto } from '@read-n-feed/application';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure, delay } from '@/lib';

export const useGetProfile = () => {
  return useQuery({
    queryKey: [QueryKey.GetProfile],
    queryFn: async () => {
      await delay(2000);

      return axiosSecure.get<UserResponseDto>(ApiRoute.Users.Me);
    },
  });
};
